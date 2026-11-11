import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// دیکته فارسی (fa-IR) برای ورودی‌های متنی
export default function DictateButton({ onText, compact = false, className }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => () => recRef.current?.abort?.(), []);

  function toggle() {
    if (listening) {
      recRef.current?.stop?.();
      setListening(false);
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      onText("__unsupported__");
      return;
    }
    const rec = new Recognition();
    rec.lang = "fa-IR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) text += `${event.results[i][0].transcript} `;
      }
      if (text.trim()) onText(text.trim());
    };
    rec.onerror = (event) => {
      setListening(false);
      const message =
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "برای دیکته، دسترسی میکروفون را در مرورگر فعال کنید."
          : event.error === "network"
            ? "سرویس تشخیص گفتار در دسترس نیست؛ اتصال اینترنت را بررسی کنید."
            : "تشخیص گفتار انجام نشد؛ دوباره تلاش کنید.";
      toast.error(message);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      toast.error("شروع دیکتهٔ گفتاری ناموفق بود؛ دوباره تلاش کنید.");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="دیکته گفتاری"
      aria-label="دیکته گفتاری"
      className={cn(
        "inline-flex items-center gap-1 rounded-md transition-colors",
        compact ? "h-6 w-6 justify-center" : "px-2 py-1 text-[11px]",
        listening ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      {compact ? null : listening ? "توقف" : "دیکته"}
    </button>
  );
}
