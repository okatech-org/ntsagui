import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, prospectInfo, type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt: string;
    
    if (type === 'report') {
      // Génération de rapport
      const conversationText = messages
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join('\n\n');

      systemPrompt = `Tu es un consultant senior chez OKA Tech. Génère un rapport d'analyse professionnel basé sur cette conversation.

PROSPECT:
- Nom: ${prospectInfo.name}
- Email: ${prospectInfo.email}
- Entreprise: ${prospectInfo.company}
- Téléphone: ${prospectInfo.phone || 'Non fourni'}

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
    } else {
      // Chat conversationnel
      systemPrompt = `Tu es un assistant commercial expert d'OKA Tech, une entreprise spécialisée en solutions IA et développement logiciel depuis 6+ ans.

RÔLES: Tu es simultanément commercial, chef de projet, et consultant technique expérimenté.

INSTRUCTIONS CRITIQUES:
1. LANGUE: Réponds toujours dans la langue du prospect
2. STYLE: Sois naturel, conversationnel, humain - PAS de robot
3. EXPERTISE: Identifie les vrais besoins business derrière les demandes
4. PROGRESSIF: Pose une seule question majeure à la fois
5. COMMERCIAL: Guide progressivement vers un appel téléphone

CONTEXTE PROSPECT:
- Nom: ${prospectInfo.name}
- Entreprise: ${prospectInfo.company}
- Téléphone: ${prospectInfo.phone || 'Non fourni'}

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
- À partir de 6+ messages, propose un appel téléphone`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: type !== 'report',
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    if (type === 'report') {
      // Non-streaming pour le rapport
      const data = await response.json();
      const report = data.choices[0]?.message?.content || 'Erreur lors de la génération du rapport';
      
      return new Response(JSON.stringify({ report }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Streaming pour le chat
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
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
