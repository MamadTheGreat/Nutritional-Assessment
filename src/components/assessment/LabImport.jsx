import { Camera, FileUp, Loader2, Sparkles, Check, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { extractLabs } from "@/lib/server-fns";

const LAB_STEPS = [
  "آماده‌سازی و بهینه‌سازی تصویر برگه آزمایش...",
  "اسکن هوشمند بینایی با مدل هوش مصنوعی Gemini Vision...",
  "شناسایی ردیف‌های آزمایش، مقادیر عددی و واحدها...",
  "بررسی محدوده‌های مرجع و شناسایی موارد غیرطبیعی (Abnormal)...",
];

// Compress large camera photos using HTML Canvas to under 1.5MB for fast reliable AI processing
function compressImage(file, maxDimension = 1800, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const [, base64] = dataUrl.split(",", 2);
        resolve({ base64, mimeType: "image/jpeg" });
      };
      img.onerror = () => reject(new Error("تصویر بارگذاری نشد."));
      img.src = String(e.target?.result || "");
    };
    reader.onerror = () => reject(new Error("خواندن فایل تصویر ناموفق بود."));
    reader.readAsDataURL(file);
  });
}

export default function LabImport({ onExtracted }) {
  const [busy, setBusy] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!busy) {
      setCurrentStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < LAB_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(interval);
  }, [busy]);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      setError("لطفاً یک فایل تصویری (JPEG، PNG یا WebP) انتخاب کنید.");
      return;
    }

    setBusy(true);
    setError("");
    setStatus("");

    try {
      // Compress and convert to base64
      const { base64, mimeType } = await compressImage(file);
      const result = await extractLabs({ data: { image: base64, mimeType } });
      const labs = result.labs || [];

      if (!labs.length) {
        if (result.summary && !result.summary.includes("متنی یافت نشد")) {
          onExtracted(result.summary);
          setStatus("متن برگه آزمایش توسط هوش مصنوعی خوانده شد و در کادر آزمایش‌ها درج گردید.");
          return;
        }
        setError(result.error || "تستی در تصویر تشخیص داده نشد. لطفاً از وضوح و زاویه مناسب عکس اطمینان حاصل کنید یا مقادیر را دستی وارد نمایید.");
        return;
      }

      const formattedLines = labs.map((lab) => {
        const valStr = [lab.value, lab.unit].filter(Boolean).join(" ");
        const refStr = lab.reference ? ` (مرجع: ${lab.reference})` : "";
        const abnormalStr = lab.abnormal ? " ⚠️ غیرطبیعی" : "";
        return `${lab.name}: ${valStr}${refStr}${abnormalStr}`;
      });

      let fullText = formattedLines.join("\n");
      if (result.summary && !result.summary.includes("متنی یافت نشد")) {
        fullText += `\n\n[خلاصه هوش مصنوعی: ${result.summary}]`;
      }

      onExtracted(fullText);
      setStatus(`${labs.length.toLocaleString("fa-IR")} مورد آزمایش با موفقیت توسط مدل بینایی Gemini استخراج شد.`);
    } catch (err) {
      setError(err?.message || "خطا در اسکن و استخراج آزمایش؛ لطفاً اطلاعات را دستی وارد کنید.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Camera className="h-4 w-4 text-primary" />}
          عکس از برگه آزمایش با دوربین
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
            disabled={busy}
          />
        </label>

        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-muted focus-within:ring-2 focus-within:ring-ring">
          <FileUp className="h-4 w-4 text-muted-foreground" />
          انتخاب عکس از گالری / فایل
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={busy}
          />
        </label>
      </div>

      <p className="text-[10px] leading-5 text-muted-foreground">
        تصویر با هوش مصنوعی بینایی Google Gemini Vision پردازش شده و فقط ردیف‌های آزمایش استخراج می‌گردند. تصویر در پایگاه ذخیره نمی‌شود.
      </p>

      {/* Step by step scanning indicator */}
      {busy ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-right">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-2">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>هوش مصنوعی در حال بازخوانی برگه آزمایش است:</span>
          </div>
          <div className="space-y-1.5">
            {LAB_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isDone = idx < currentStepIndex;
              return (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-[11.5px] ${
                    isDone
                      ? "text-emerald-700 font-medium"
                      : isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                  ) : (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border mr-1" />
                  )}
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-[11.5px] leading-5 text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      {status ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-[11.5px] font-medium text-emerald-800">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{status}</span>
        </div>
      ) : null}
    </div>
  );
}
