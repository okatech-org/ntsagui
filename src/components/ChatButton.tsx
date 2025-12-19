import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import AIChatbot from "./AIChatbot";

const ChatButton = () => {
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <>
      {!showChatbot && (
        <Button
          variant="hero"
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elegant z-40 animate-in fade-in zoom-in"
          onClick={() => setShowChatbot(true)}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}

      {showChatbot && (
        <AIChatbot
          prospectInfo={{
            name: "Guest",
            email: "guest@example.com",
            company: "Visitor",
          }}
          onClose={() => setShowChatbot(false)}
          onReportGenerated={() => {
            setTimeout(() => setShowChatbot(false), 3000);
          }}
        />
      )}
    </>
  );
};

export default ChatButton;
