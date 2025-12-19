import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, Loader2, FileText, Phone } from "lucide-react";
import { toast } from "sonner";
import leadStorage from "@/lib/leadStorage";
import pdfGenerator from "@/lib/pdfGenerator";
import { openAIService } from "@/lib/openai";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

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

    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Utiliser le service OpenAI local
      const conversationHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const result = await openAIService.analyzeAndRespond(
        userMessage,
        conversationHistory,
        {
          name: prospectInfo.name,
          email: prospectInfo.email,
          company: prospectInfo.company,
          phone: collectedPhone || prospectInfo.phone,
        },
        messages.filter(m => m.role === 'user').length + 1
      );

      const assistantMessage: Message = {
        role: "assistant",
        content: result.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShouldCollectContact(result.shouldCollectContact);

      // Si on doit collecter et qu'on a le téléphone, générer le rapport
      if (result.shouldCollectContact && collectedPhone) {
        setTimeout(() => {
          generateReport();
        }, 1000);
      }

    } catch (error) {
      toast.error(t('chatbot.error'));
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);

    try {
      // Utiliser le service OpenAI local pour générer le rapport
      const conversation = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const report = await openAIService.generateReport(conversation, {
        name: prospectInfo.name,
        email: prospectInfo.email,
        company: prospectInfo.company,
        phone: collectedPhone || prospectInfo.phone,
      });

      // Extraire le score du rapport
      const scoreMatch = report.match(/Score:\s*(\d+)\/100/i);
      const fitScore = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 30) + 70;

      const lead = leadStorage.saveLead({
        name: prospectInfo.name,
        email: prospectInfo.email,
        company: prospectInfo.company,
        phone: collectedPhone || prospectInfo.phone,
        conversation: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        report: report,
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
