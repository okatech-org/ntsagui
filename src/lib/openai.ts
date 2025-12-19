import neocortexClient, {
  NEOCORTEX_ENABLED,
  generateSessionId,
  type ChatMessage as NeocortexMessage,
  type SignalMessage
} from './neocortexClient';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// État pour les réponses NEOCORTEX en attente
const pendingResponses: Map<string, {
  resolve: (response: string) => void;
  reject: (error: Error) => void;
}> = new Map();

// Gestionnaire de messages WebSocket NEOCORTEX
let wsInitialized = false;

function initNeocortexWebSocket() {
  if (wsInitialized || !NEOCORTEX_ENABLED) return;

  const sessionId = generateSessionId();

  neocortexClient.connectWebSocket(sessionId).then(() => {
    neocortexClient.onMessage((message: SignalMessage) => {
      if (message.type === 'ASSISTANT_RESPONSE' && message.payload?.response) {
        // Résoudre la promesse en attente
        const correlationId = message.payload.session_id || sessionId;
        const pending = pendingResponses.get(correlationId);
        if (pending) {
          pending.resolve(message.payload.response);
          pendingResponses.delete(correlationId);
        }
      } else if (message.type === 'error') {
        // Gérer les erreurs
        const sessionId = generateSessionId();
        const pending = pendingResponses.get(sessionId);
        if (pending) {
          pending.reject(new Error(message.error || 'Unknown error'));
          pendingResponses.delete(sessionId);
        }
      }
    });
    wsInitialized = true;
  }).catch(console.error);
}

class AIService {
  private chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

  async chat(messages: Message[], prospectInfo: any, type: 'chat' | 'report' = 'chat'): Promise<string> {
    const response = await fetch(this.chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages,
        prospectInfo,
        type,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limits exceeded, please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required, please add funds.');
      }
      throw new Error(`API error: ${response.status}`);
    }

    if (type === 'report') {
      const data = await response.json();
      return data.report;
    }

    // Streaming for chat
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) fullContent += content;
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    return fullContent;
  }

  async generateContextualResponse(
    userMessage: string,
    conversationHistory: Message[],
    prospectInfo: any
  ): Promise<string> {
    // Mode NEOCORTEX: Utilise le pipeline Kafka via Cortex Sensoriel
    if (NEOCORTEX_ENABLED) {
      return this.generateViaNeocortex(userMessage, conversationHistory, prospectInfo);
    }

    // Mode Legacy: Appel direct à Supabase Edge Function
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, prospectInfo, 'chat');
  }

  /**
   * Génère une réponse via le pipeline NEOCORTEX
   * Envoie le message au Cortex Sensoriel qui le route vers Cortex NLP via Kafka
   */
  private async generateViaNeocortex(
    userMessage: string,
    conversationHistory: Message[],
    prospectInfo: any
  ): Promise<string> {
    // Initialiser WebSocket si pas encore fait
    initNeocortexWebSocket();

    const sessionId = generateSessionId();

    // Convertir l'historique au format NEOCORTEX
    const history: NeocortexMessage[] = conversationHistory.map(m => ({
      role: m.role,
      content: m.content
    }));

    // Envoyer le message au Cortex Sensoriel
    try {
      const response = await neocortexClient.sendMessage({
        session_id: sessionId,
        message: userMessage,
        prospect_info: {
          name: prospectInfo.name || '',
          email: prospectInfo.email || '',
          company: prospectInfo.company || '',
          phone: prospectInfo.phone
        },
        conversation_history: history,
        language: this.detectLanguage(userMessage) === 'FR' ? 'fr' : 'en'
      });

      if (response.status !== 'accepted') {
        throw new Error(response.error || 'Message rejected');
      }

      // Attendre la réponse via WebSocket (avec timeout)
      return new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          pendingResponses.delete(sessionId);
          // Fallback vers l'ancien système en cas de timeout
          console.warn('NEOCORTEX timeout, falling back to legacy');
          const messages: Message[] = [
            ...conversationHistory,
            { role: 'user', content: userMessage }
          ];
          this.chat(messages, prospectInfo, 'chat').then(resolve).catch(reject);
        }, 30000); // 30 secondes timeout

        pendingResponses.set(sessionId, {
          resolve: (response: string) => {
            clearTimeout(timeout);
            resolve(response);
          },
          reject: (error: Error) => {
            clearTimeout(timeout);
            reject(error);
          }
        });
      });

    } catch (error) {
      console.error('NEOCORTEX error, falling back to legacy:', error);
      // Fallback vers l'ancien système
      const messages: Message[] = [
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];
      return this.chat(messages, prospectInfo, 'chat');
    }
  }

  async generateReport(conversation: any[], prospectInfo: any): Promise<string> {
    const messages = conversation.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    return this.chat(messages, prospectInfo, 'report');
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
    const response = await this.generateContextualResponse(
      userMessage,
      conversationHistory,
      prospectInfo
    );

    const shouldCollectContact = messageCount >= 6 || this.shouldCollectContactInfo(response);
    const language = this.detectLanguage(userMessage);

    return {
      response,
      shouldCollectContact,
      detectedLanguage: language,
    };
  }

  private detectLanguage(text: string): string {
    const frenchWords = ['je', 'vous', 'merci', 'oui', 'non', 'français', 'bonjour', 'problème'];
    const englishWords = ['i', 'you', 'thank', 'yes', 'no', 'english', 'hello', 'problem'];

    const lowerText = text.toLowerCase();
    const frenchCount = frenchWords.filter(word => lowerText.includes(word)).length;
    const englishCount = englishWords.filter(word => lowerText.includes(word)).length;

    return frenchCount > englishCount ? 'FR' : 'EN';
  }

  private shouldCollectContactInfo(response: string): boolean {
    const phoneKeywords = ['appel', 'téléphone', 'phone', 'contact', 'coordonnées', 'numéro'];
    const lowerResponse = response.toLowerCase();
    return phoneKeywords.some(kw => lowerResponse.includes(kw));
  }
}

export const openAIService = new AIService();
export default openAIService;
