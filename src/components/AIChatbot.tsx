import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Loader2, FileText, Download, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import leadStorage from "@/lib/leadStorage";
import pdfGenerator from "@/lib/pdfGenerator";
import { openAIService } from "@/lib/openai";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeStyles } from "@/hooks/useThemeStyles";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  prospectInfo: {
    name: string;
    email: string;
    company: string;
    phone?: string;
  };
  onClose: () => void;
  onReportGenerated: () => void;
}

const AIChatbot = ({ prospectInfo, onClose, onReportGenerated }: AIChatbotProps) => {
  const { t, language } = useLanguage();
  const themeStyles = useThemeStyles();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t('chatbot.initialMessage'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldCollectContact, setShouldCollectContact] = useState(false);
  const [collectedPhone, setCollectedPhone] = useState(prospectInfo.phone || "");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Vérifier les coordonnées si demandé
    if (shouldCollectContact && !collectedPhone) {
      toast.error(t('chatbot.phoneRequired'));
      return;
    }

    const userMessage = input.trim();
    setInput("");

    setMessages(prev => [...prev, {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    }]);

    setIsLoading(true);

    // Ajouter un message assistant vide qu'on va remplir progressivement
    setMessages(prev => [...prev, {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            conversationId,
            userMessage,
            language,
            prospectInfo: {
              leadId,
              name: prospectInfo.name,
              email: prospectInfo.email,
              company: prospectInfo.company,
              phone: collectedPhone || prospectInfo.phone,
            }
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Limite de requêtes atteinte, veuillez réessayer plus tard.");
        } else if (response.status === 402) {
          toast.error("Crédit insuffisant.");
        } else {
          throw new Error(`HTTP error ${response.status}`);
        }
        // Supprimer le message assistant vide
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';
      let metadata: any = null;

      while (!streamDone) {
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
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.type === 'metadata') {
              // Stocker les métadonnées
              metadata = parsed;
            } else if (parsed.content) {
              // Mise à jour progressive du contenu
              assistantContent += parsed.content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                  timestamp: new Date(),
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Gérer les erreurs de parsing JSON
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Traiter les métadonnées finales
      if (metadata) {
        if (metadata.conversationId && !conversationId) {
          setConversationId(metadata.conversationId);
        }
        if (metadata.leadId && !leadId) {
          setLeadId(metadata.leadId);
        }
        setShouldCollectContact(metadata.shouldCollectContact);

        // Afficher le score du lead si présent
        if (metadata.leadScore !== undefined) {
          console.log('Lead Score:', metadata.leadScore);
        }

        // Si on doit collecter et qu'on a le téléphone, générer le rapport
        if (metadata.shouldCollectContact && collectedPhone) {
          setTimeout(() => {
            generateReport();
          }, 1000);
        }
      }

    } catch (error) {
      toast.error(t('chatbot.error'));
      console.error("Error:", error);
      // Supprimer le message assistant vide en cas d'erreur
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!conversationId) {
      toast.error(t('chatbot.error'));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { conversationId }
      });

      if (error) throw error;

      const fitScore = data.compatibilityScore || Math.floor(Math.random() * 30) + 70;

      const lead = leadStorage.saveLead({
        name: data.prospectInfo.name,
        email: data.prospectInfo.email,
        company: data.prospectInfo.company,
        phone: collectedPhone || data.prospectInfo.phone,
        conversation: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        report: data.report,
        fitScore: fitScore,
        status: 'new',
      });

      console.log("Lead saved:", lead);
      toast.success(t('chatbot.reportGenerated'), { duration: 3000 });

      setTimeout(() => {
        pdfGenerator.generateReportPDF(lead);
        setReportGenerated(true);
      }, 500);

      onReportGenerated();
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(t('chatbot.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-2rem)] shadow-elegant border-2 border-primary/20 flex flex-col z-50">
      <div className="gradient-primary p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-primary-foreground" />
          <div>
            <h3 className="font-semibold text-primary-foreground">{t('chatbot.title')}</h3>
            <p className="text-xs text-primary-foreground/80">{t('chatbot.subtitle')}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/10">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
                }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {shouldCollectContact && !reportGenerated && (
        <div className="p-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-start gap-3 mb-3">
            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">{t('chatbot.phoneRequired')}</p>
              <p className="text-xs text-blue-800 mt-1">
                Un expert d'OKA Tech vous contactera rapidement
              </p>
            </div>
          </div>
          <Input
            type="tel"
            value={collectedPhone}
            onChange={(e) => setCollectedPhone(e.target.value)}
            placeholder={t('chatbot.phonePlaceholder')}
            className="mb-2"
          />
        </div>
      )}

      {reportGenerated && (
        <div className="p-4 bg-green-50 border-t border-green-200">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">{t('chatbot.reportGenerated')}</p>
              <p className="text-xs text-green-800 mt-1">
                Vous recevrez bientôt l'analyse complète par email
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              reportGenerated
                ? t('chatbot.generatingReport')
                : t('chatbot.inputPlaceholder')
            }
            disabled={isLoading || reportGenerated}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || reportGenerated}
            size="icon"
            variant="hero"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChatbot;
