interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletion {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

class OpenAIService {
  private apiKey: string;
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY environment variable.');
    }
  }

  async chat(messages: Message[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
      }

      const data: ChatCompletion = await response.json();
      return data.choices[0]?.message?.content || 'No response from AI';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async generateContextualResponse(
    userMessage: string,
    conversationHistory: Message[],
    prospectInfo: any
  ): Promise<string> {
    const detectedLanguage = this.detectLanguage(userMessage);
    
    const systemPrompt = `Tu es un assistant commercial expert d'OKA Tech, une entreprise spécialisée en solutions IA et développement logiciel depuis 6+ ans.

RÔLES: Tu es simultanément commercial, chef de projet, et consultant technique expérimenté.

INSTRUCTIONS CRITIQUES:
1. LANGUE: Réponds toujours dans la langue du prospect (Français ou Anglais détecté)
2. STYLE: Sois naturel, conversationnel, humain - PAS de robot
3. EXPERTISE: Identifie les vrais besoins business derrière les demandes
4. PROGRESSIF: Pose une seule question majeure à la fois
5. COMMERCIAL: Guide progressivement vers un appel téléphone

CONTEXTE PROSPECT:
- Nom: ${prospectInfo.name}
- Entreprise: ${prospectInfo.company}
- Téléphone: ${prospectInfo.phone || 'Non fourni'}
- Langue: ${detectedLanguage}

PHASE DE CONVERSATION ACTUELLE:
- Messages précédents: ${conversationHistory.length}
- Besoin identifié: ${this.identifyNeed(conversationHistory)}

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
- Si le prospect demande de changer de langue, réponds TOUJOURS dans sa langue
- À partir de 6+ messages, propose un appel téléphone

Historique conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Prospect: ${userMessage}`;

    const messages: Message[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    return this.chat(messages);
  }

  private detectLanguage(text: string): string {
    const frenchWords = ['je', 'vous', 'merci', 'oui', 'non', 'français', 'bonjour', 'problème'];
    const englishWords = ['i', 'you', 'thank', 'yes', 'no', 'english', 'hello', 'problem'];
    
    const lowerText = text.toLowerCase();
    const frenchCount = frenchWords.filter(word => lowerText.includes(word)).length;
    const englishCount = englishWords.filter(word => lowerText.includes(word)).length;
    
    return frenchCount > englishCount ? 'FR' : 'EN';
  }

  private identifyNeed(conversationHistory: Message[]): string {
    const allText = conversationHistory.map(m => m.content).join(' ').toLowerCase();
    
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

  async generateReport(conversation: any[], prospectInfo: any): Promise<string> {
    const conversationText = conversation
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const messages: Message[] = [
      {
        role: 'system',
        content: `Tu es un consultant senior chez OKA Tech. Génère un rapport d'analyse professionnel basé sur cette conversation.

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
   - Qui contacter`
      },
      {
        role: 'user',
        content: 'Génère le rapport d\'analyse',
      },
    ];

    return this.chat(messages);
  }

  async analyzeAndRespond(
    userMessage: string,
    conversationHistory: Message[],
    prospectInfo: any,
    messageCount: number
  ): Promise<{
    response: string;
    shouldCollectContact: boolean;
    detectedLanguage: string;
  }> {
    const language = this.detectLanguage(userMessage);
    const response = await this.generateContextualResponse(
      userMessage,
      conversationHistory,
      prospectInfo
    );

    const shouldCollectContact = messageCount >= 6 || this.shouldCollectContactInfo(response);

    return {
      response,
      shouldCollectContact,
      detectedLanguage: language,
    };
  }

  private shouldCollectContactInfo(response: string): boolean {
    const phoneKeywords = ['appel', 'téléphone', 'phone', 'contact', 'coordonnées', 'numéro'];
    const lowerResponse = response.toLowerCase();
    return phoneKeywords.some(kw => lowerResponse.includes(kw));
  }

  async sendMessage(userMessage: string, context: any): Promise<{ data: { response: string; shouldCollectContact: boolean; conversationId?: string; leadId?: string } | null; error: any }> {
    try {
      const conversationHistory: Message[] = [];
      const response = await this.generateContextualResponse(
        userMessage,
        conversationHistory,
        context.prospectInfo
      );

      const shouldCollectContact = this.shouldCollectContactInfo(response);

      return {
        data: {
          response,
          shouldCollectContact,
          conversationId: context.conversationId,
          leadId: context.prospectInfo.leadId
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const openAIService = new OpenAIService();
export default openAIService;
