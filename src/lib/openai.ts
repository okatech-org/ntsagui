interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return this.chat(messages, prospectInfo, 'chat');
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
