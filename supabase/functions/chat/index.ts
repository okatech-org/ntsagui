import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, userMessage, prospectInfo, language } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer ou créer le lead
    let leadId = prospectInfo.leadId;
    if (!leadId) {
      const { data: lead, error: leadError } = await supabaseClient
        .from('leads')
        .insert({
          name: prospectInfo.name,
          email: prospectInfo.email,
          company: prospectInfo.company,
          phone: prospectInfo.phone,
          language: detectLanguage(userMessage)
        })
        .select()
        .single();

      if (leadError) throw leadError;
      leadId = lead.id;
    }

    // Récupérer ou créer la conversation
    let conversation;
    if (conversationId) {
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      conversation = data;
    } else {
      const { data, error } = await supabaseClient
        .from('conversations')
        .insert({
          lead_id: leadId,
          messages: []
        })
        .select()
        .single();

      if (error) throw error;
      conversation = data;
    }

    // Construire l'historique de conversation
    const messages = conversation.messages || [];
    messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    // Préparer le prompt système
    const detectedLanguage = language || detectLanguage(userMessage);
    const identifiedNeed = identifyNeed(messages);
    const phase = Math.min(Math.floor(messages.filter((m: any) => m.role === 'user').length / 2) + 1, 3);

    const systemPrompt = buildSystemPrompt(prospectInfo, detectedLanguage, messages.length, identifiedNeed, phase);

    // Appeler Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Map language codes to full names for clarity
    const languageMap: { [key: string]: string } = {
      'fr': 'FRANÇAIS',
      'en': 'ENGLISH',
      'es': 'ESPAÑOL',
      'ar': 'العربية (ARABIC)'
    };
    const fullLanguageName = languageMap[detectedLanguage.toLowerCase()] || 'FRANÇAIS';

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10, -1).map((m: any) => ({ role: m.role, content: m.content })),
          {
            role: 'user',
            content: `${messages[messages.length - 1].content} (IMPORTANT: Réponds UNIQUEMENT en ${fullLanguageName})`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Crédit insuffisant, veuillez ajouter des fonds." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    // Stream SSE vers le client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiResponse.body!.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let textBuffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            textBuffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
              let line = textBuffer.slice(0, newlineIndex);
              textBuffer = textBuffer.slice(newlineIndex + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") {
                // Calculer le score du lead
                const leadScore = calculateLeadScore(messages, assistantMessage, identifiedNeed, phase);

                // Ajouter la réponse complète à l'historique
                messages.push({
                  role: 'assistant',
                  content: assistantMessage,
                  timestamp: new Date().toISOString()
                });

                // Mettre à jour la conversation avec le score
                await supabaseClient
                  .from('conversations')
                  .update({
                    messages,
                    identified_need: identifiedNeed,
                    phase,
                    compatibility_score: leadScore,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', conversation.id);

                // Envoyer les métadonnées finales
                const shouldCollectContact = messages.filter((m: any) => m.role === 'user').length >= 6 ||
                  shouldCollectContactInfo(assistantMessage);

                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({
                      type: 'metadata',
                      conversationId: conversation.id,
                      leadId,
                      shouldCollectContact,
                      detectedLanguage,
                      phase,
                      leadScore
                    })}\n\n`
                  )
                );
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                break;
              }

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) {
                  assistantMessage += content;
                  // Envoyer le token au client
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch {
                textBuffer = line + "\n" + textBuffer;
                break;
              }
            }
          }

          // Flush final buffer
          if (textBuffer.trim()) {
            for (let raw of textBuffer.split("\n")) {
              if (!raw) continue;
              if (raw.endsWith("\r")) raw = raw.slice(0, -1);
              if (raw.startsWith(":") || raw.trim() === "") continue;
              if (!raw.startsWith("data: ")) continue;
              const jsonStr = raw.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content as string | undefined;
                if (content) {
                  assistantMessage += content;
                  controller.enqueue(
                    new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
                }
              } catch { /* ignore */ }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function detectLanguage(text: string): string {
  const frenchWords = ['je', 'vous', 'merci', 'oui', 'non', 'français', 'bonjour', 'problème', 'besoin', 'entreprise'];
  const englishWords = ['i', 'you', 'thank', 'yes', 'no', 'english', 'hello', 'problem', 'need', 'company'];
  const spanishWords = ['yo', 'usted', 'gracias', 'sí', 'español', 'hola', 'problema', 'necesito', 'empresa'];
  const arabicWords = ['أنا', 'أنت', 'شكرا', 'نعم', 'لا', 'عربي', 'مرحبا', 'مشكلة', 'احتاج', 'شركة'];

  const lowerText = text.toLowerCase();
  const frenchCount = frenchWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
  const spanishCount = spanishWords.filter(word => lowerText.includes(word)).length;
  const arabicCount = arabicWords.filter(word => text.includes(word)).length; // Ne pas lowercase pour l'arabe

  const counts = {
    'FR': frenchCount,
    'EN': englishCount,
    'ES': spanishCount,
    'AR': arabicCount
  };

  // Retourner la langue avec le plus de mots détectés
  const maxLang = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  return maxLang;
}

function identifyNeed(messages: any[]): string {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();

  const needs: { [key: string]: string[] } = {
    'Patient Management': ['patient', 'médecin', 'généraliste', 'appointment', 'consultation', 'dossier'],
    'E-commerce': ['shop', 'store', 'vendre', 'commerce', 'produit', 'panier'],
    'CRM': ['client', 'customer', 'contact', 'relation', 'commercial'],
    'Business Automation': ['automatis', 'workflow', 'process', 'efficacité', 'temps'],
    'Data Analytics': ['données', 'data', 'analytics', 'report', 'insight'],
  };

  for (const [need, keywords] of Object.entries(needs)) {
    if (keywords.some(kw => allText.includes(kw))) {
      return need;
    }
  }

  return 'Not identified yet';
}

function shouldCollectContactInfo(response: string): boolean {
  const phoneKeywords = ['appel', 'téléphone', 'phone', 'contact', 'coordonnées', 'numéro', 'llamar', 'teléfono', 'contacto', 'اتصال', 'هاتف'];
  const lowerResponse = response.toLowerCase();
  return phoneKeywords.some(kw => lowerResponse.includes(kw) || response.includes(kw));
}

function calculateLeadScore(messages: any[], lastResponse: string, identifiedNeed: string, phase: number): number {
  let score = 0;
  
  // Score basé sur le nombre de messages (max 30 points)
  const userMessages = messages.filter((m: any) => m.role === 'user');
  score += Math.min(userMessages.length * 3, 30);
  
  // Score basé sur la longueur moyenne des messages utilisateur (max 20 points)
  const avgLength = userMessages.reduce((sum: number, m: any) => sum + m.content.length, 0) / userMessages.length;
  if (avgLength > 50) score += 10;
  if (avgLength > 100) score += 10;
  
  // Score basé sur l'identification du besoin (max 20 points)
  if (identifiedNeed !== 'Not identified yet') score += 20;
  
  // Score basé sur la phase de conversation (max 15 points)
  score += phase * 5;
  
  // Score basé sur l'engagement (max 15 points)
  const hasQuestions = userMessages.some((m: any) => m.content.includes('?'));
  if (hasQuestions) score += 10;
  if (userMessages.length > 5) score += 5;
  
  // Bonus si la conversation mentionne des détails techniques (max 10 points)
  const technicalKeywords = ['api', 'database', 'système', 'intégration', 'automatisation', 'ia', 'ai', 'données'];
  const hasTechnicalTerms = messages.some((m: any) => 
    technicalKeywords.some(kw => m.content.toLowerCase().includes(kw))
  );
  if (hasTechnicalTerms) score += 10;
  
  return Math.min(score, 100);
}

function buildSystemPrompt(prospectInfo: any, language: string, messageCount: number, need: string, phase: number): string {
  // Map language codes to full names for clarity
  const languageMap: { [key: string]: string } = {
    'fr': 'FRANÇAIS',
    'en': 'ENGLISH',
    'es': 'ESPAÑOL',
    'ar': 'العربية (ARABIC)'
  };

  const fullLanguageName = languageMap[language.toLowerCase()] || 'FRANÇAIS';

  return `⚠️ RÈGLE ABSOLUE: Tu DOIS répondre UNIQUEMENT en ${fullLanguageName}. JAMAIS en anglais si le prospect parle ${fullLanguageName}. ⚠️

Tu es un assistant commercial expert d'OKA Tech, une entreprise spécialisée en solutions IA et développement logiciel depuis 6+ ans.

RÔLES: Tu es simultanément commercial, chef de projet, et consultant technique expérimenté.

INSTRUCTIONS CRITIQUES (PAR ORDRE DE PRIORITÉ):
1. 🌍 LANGUE: TOUJOURS répondre en ${fullLanguageName} - C'EST LA RÈGLE #1 ABSOLUE
2. 🎭 STYLE: Sois naturel, conversationnel, humain - PAS de robot
3. 🎯 EXPERTISE: Identifie les vrais besoins business derrière les demandes
4. 📊 PROGRESSIF: Pose une seule question majeure à la fois
5. 📞 COMMERCIAL: Guide progressivement vers un appel téléphone

CONTEXTE PROSPECT:
- Nom: ${prospectInfo.name}
- Entreprise: ${prospectInfo.company}
- Téléphone: ${prospectInfo.phone || 'Non fourni'}
- Langue préférée: ${fullLanguageName}

PHASE DE CONVERSATION ACTUELLE:
- Messages précédents: ${messageCount}
- Besoin identifié: ${need}
- Phase: ${phase}

PROCESSUS DE QUALIFICATION:
Phase 1 (0-2 messages): DISCOVERY
  - Comprendre le problème principal
  - Être empathique et curieux
  - Poser des questions ouvertes

Phase 2 (3-5 messages): DEEP DIVE
  - Context technique (infrastructure, outils actuels)
  - Ressources (équipe, budget, timeline)
  - Contraintes et risques

Phase 3 (6+ messages): QUALIFICATION & RECRUTEMENT
  - Confirmer l'alignement avec OKA Tech
  - Proposer un appel découverte
  - Récupérer les coordonnées si manquantes
  - Planifier un suivi

RÉPONSE A DONNER:
- Soit pertinent et concis (2-3 phrases max)
- Propose une valeur ajoutée immédiate
- Pose UNE question engageante
- À partir de 6+ messages, propose un appel téléphone

⚠️ RAPPEL FINAL: Réponds EXCLUSIVEMENT en ${fullLanguageName}. Aucune exception. ⚠️`;
}