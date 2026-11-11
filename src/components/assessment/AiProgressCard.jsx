import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles, Globe, BookOpen, HeartPulse, Pill, FileText } from "lucide-react";

const CLINICAL_EVAL_STEPS = [
  {
    title: "محاسبه شاخص‌های آنتروپومتریک و غربالگری ریسک NRS-2002",
    description: "محاسبه قطعی BMI، وزن ایده‌آل (IBW)، درصد کاهش وزن و سطح خطر سوءتغذیه بیمار",
    icon: HeartPulse,
  },
  {
    title: "انطباق با پروتکل‌ها و فرمولاهای کتابخانه بیمارستان",
    description: "محاسبه کالری پایه، اهداف پروتئین و حجم مایعات بر اساس استرس‌فاکتور پروتکل انتخابی",
    icon: BookOpen,
  },
  {
    title: "جست‌وجوی پیشرفته گایدلاین‌های بالینی (ESPEN / ASPEN / UpToDate)",
    description: "سرچ زنده آنلاین دربارهٔ تشخیص اصلی، بیماری‌های زمینه‌ای و نیازهای تغذیه‌ای اختصاصی بیمار",
    icon: Globe,
  },
  {
    title: "پایش آزمایشگاهی، تداخلات غذا-دارو و نیازمندی‌های ریزمغذی",
    description: "بررسی داروهای بیمار جهت تداخلات تغذیه‌ای و پیشنهاد مکمل‌ها بر پایه راهنماهای میکرونوترینت",
    icon: Pill,
  },
  {
    title: "تدوین برنامه جامع مراقبت تغذیه‌ای و یادداشت رسمی پرونده",
    description: "تنظیم متن استاندارد مشاوره تغذیه جهت درج در پرونده پزشکی و تعیین فواصل پایش بالینی",
    icon: FileText,
  },
];

export default function AiProgressCard() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < CLINICAL_EVAL_STEPS.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.round(((currentStep + 1) / CLINICAL_EVAL_STEPS.length) * 100);

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-b from-primary/10 via-card to-card p-4 shadow-md transition-all">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow">
            <Sparkles className="h-4 w-4 animate-spin" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              هوش مصنوعی در حال تحلیل و ارزیابی جامع بالینی است...
            </h4>
            <p className="text-[10.5px] text-muted-foreground">
              تلفیق محاسبات بالینی، منابع کتابخانه و جست‌وجوی هوشمند گایدلاین‌های جهانی
            </p>
          </div>
        </div>
        <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary">
          {progressPercent.toLocaleString("fa-IR")}٪
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step List */}
      <div className="mt-4 space-y-2.5">
        {CLINICAL_EVAL_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.title}
              className={`flex items-start gap-3 rounded-xl p-2.5 transition-all ${
                isCurrent
                  ? "border border-primary/30 bg-primary/10 shadow-sm"
                  : isDone
                  ? "bg-muted/40 text-muted-foreground"
                  : "opacity-40"
              }`}
            >
              <div
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                  isDone
                    ? "bg-emerald-100 text-emerald-700"
                    : isCurrent
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11.5px] font-bold ${
                      isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    گام {(idx + 1).toLocaleString("fa-IR")}: {step.title}
                  </span>
                  {isCurrent ? (
                    <span className="inline-block h-2 w-2 animate-ping rounded-full bg-primary" />
                  ) : null}
                </div>
                <p className="mt-0.5 text-[10.5px] leading-5 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
