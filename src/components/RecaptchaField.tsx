import { useRef, useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface RecaptchaFieldProps {
  onVerify: (token: string) => void;
  onError?: () => void;
}

const RecaptchaField = ({ onVerify, onError }: RecaptchaFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha && containerRef.current) {
        window.grecaptcha.render(containerRef.current, {
          sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
          callback: onVerify,
          "error-callback": onError,
        });
        setIsLoaded(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [onVerify, onError]);

  return (
    <div ref={containerRef} className="flex justify-center" style={{ minHeight: "78px" }} />
  );
};

export default RecaptchaField;
