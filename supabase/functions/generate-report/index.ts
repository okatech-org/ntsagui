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
    const { conversationId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer la conversation et le lead
    const { data: conversation, error: convError } = await supabaseClient
      .from('conversations')
      .select('*, leads(*)')
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    const lead = conversation.leads;
    const messages = conversation.messages || [];

    // Préparer le texte de conversation
    const conversationText = messages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    // Appeler Lovable AI pour générer le rapport
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Tu es un consultant senior chez OKA Tech. Génère un rapport d'analyse professionnel basé sur cette conversation.

PROSPECT:
- Nom: ${lead.name}
- Email: ${lead.email}
- Entreprise: ${lead.company}
- Téléphone: ${lead.phone || 'Non fourni'}

CONVERSATION:
${conversationText}

FORMAT RAPPORT:
1. RÉSUMÉ EXÉCUTIF (2-3 phrases)
   - Problème principal identifié
   - Valeur estimée de la solution

2. ANALYSE DÉTAILLÉE (4-5 points)
   - Besoin métier spécifique
   - Infrastructure actuelle
   - Défis identifiés
   - Opportunités

3. SOLUTIONS RECOMMANDÉES (3-4 options)
   - Solution 1: Description brève + Bénéfices
   - Solution 2: Description brève + Bénéfices
   - Solution 3: Description brève + Bénéfices

4. TIMELINE D'IMPLÉMENTATION
   - Phase 1 (1-2 mois): Préparation et design
   - Phase 2 (2-3 mois): Développement
   - Phase 3 (1 mois): Tests et déploiement

5. SCORE DE COMPATIBILITÉ
   - Score: X/100
   - Justification

6. PROCHAINES ÉTAPES
   - Action recommandée
   - Timing
   - Qui contacter

Génère le rapport complet maintenant.`;

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
          { role: 'user', content: 'Génère le rapport d\'analyse complet' }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const report = aiData.choices[0]?.message?.content || 'Erreur lors de la génération du rapport';

    // Extraire le score de compatibilité du rapport
    const scoreMatch = report.match(/Score:\s*(\d+)\/100/i);
    const compatibilityScore = scoreMatch ? parseInt(scoreMatch[1]) : null;

    // Mettre à jour la conversation avec le rapport
    const { error: updateError } = await supabaseClient
      .from('conversations')
      .update({
        report,
        compatibility_score: compatibilityScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        report,
        compatibilityScore,
        prospectInfo: {
          name: lead.name,
          email: lead.email,
          company: lead.company,
          phone: lead.phone
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-report function:', error);
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