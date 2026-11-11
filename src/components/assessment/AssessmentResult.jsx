import { AlertTriangle, Check, Copy } from "lucide-react";
import { useState } from "react";
import { fmt } from "@/lib/clinical";
import { cn } from "@/lib/utils";

const TONE = {
  ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-red-50 text-red-800 border-red-200",
  neutral: "bg-muted text-muted-foreground border-border",
};

function Row({ index, label, children }) {
  return (
    <li className="flex gap-3 border-b border-border px-4 py-2.5 last:border-b-0">
      <span className="num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-medium tracking-tight text-muted-foreground">{label}</p>
        <div className="mt-0.5 text-[13px] leading-6 text-foreground">{children}</div>
      </div>
    </li>
  );
}

function Bullets({ items, empty }) {
  if (!items?.length) return <span className="text-muted-foreground">{empty}</span>;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
          <span className="leading-6">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AssessmentResult({ result, protocolName }) {
  const [copied, setCopied] = useState(false);

  async function copyNote() {
    await navigator.clipboard.writeText(result.record_note || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", TONE[result.nrs?.tone || "neutral"])}>
            NRS-2002: {result.nrs?.total} — {result.nrs?.level}
          </span>
          <span className="text-[10.5px] text-muted-foreground">{protocolName || "پروتکل عمومی"}</span>
        </div>
        <span className={cn("rounded border px-1.5 py-0.5 text-[10.5px] font-semibold", TONE[result.bmiTone || "neutral"])}>
          BMI {result.bmiValue} — {result.bmiLabel}
        </span>
      </header>

      {result.ai_error ? (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[11.5px] leading-6 text-amber-900">
          محاسبهٔ BMI، NRS، انرژی، پروتئین و مایع انجام شد. پیش‌نویس هوش مصنوعی آماده نیست: {result.ai_error}
        </div>
      ) : null}

      <ol>
        <Row index="۱" label="شاخص توده بدنی (BMI)">
          <span className="num font-semibold">{fmt(result.bmiValue, 1)}</span>
          <span className="text-muted-foreground"> — {result.bmiLabel}</span>
        </Row>
        <Row index="۲" label="وزن ایده‌آل (BMI=22)">
          <span className="num font-semibold">{fmt(result.ibw, 1)}</span> kg
        </Row>
        <Row index="۳" label="آزمایش‌های مورد نیاز">
          <Bullets items={result.required_labs} empty="—" />
        </Row>
        <Row index="۴" label="انرژی روزانه">
          <span className="num font-semibold">{fmt(result.calorie)}</span> kcal
        </Row>
        <Row index="۵" label="پروتئین روزانه">
          <span className="num font-semibold">{fmt(result.protein)}</span> g
          <span className="text-muted-foreground">
            {" "}
            (≈ {fmt(result.protein / (result.ibw || 1), 1)} g/kg)
          </span>
        </Row>
        <Row index="۶" label="مایع روزانه">
          <span className="num font-semibold">{fmt(result.fluid)}</span> ml
        </Row>
        <Row index="۷" label="مکمل تغذیه‌ای / ONS">
          <span className="leading-6">{result.supplement || "—"}</span>
          <span className="mt-0.5 block text-[10px] leading-5 text-muted-foreground">
            بر پایه ESPEN micronutrient guideline — پیشنهاد است و تجویز خودکار نیست؛ نیازمند تأیید و قضاوت بالینی.
          </span>
        </Row>
        <Row index="۸" label="تداخل غذا-دارو">
          <Bullets items={result.drug_interactions} empty="تداخل ماژور یافت نشد" />
        </Row>
        <Row index="۹" label="اصول رژیم غذایی">
          <Bullets items={result.diet_principles} empty="—" />
        </Row>
        <Row index="۱۰" label="مشاوره تغذیه (متن پرونده)">
          <div className="rounded-lg border border-border bg-muted/50 p-2.5">
            <p className="whitespace-pre-wrap leading-6">{result.record_note || "—"}</p>
            <button
              type="button"
              onClick={copyNote}
              className="mt-2 inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "کپی شد" : "کپی برای پرونده"}
            </button>
          </div>
        </Row>
      </ol>

      {result.nrs?.total >= 3 ? (
        <div className="flex items-center gap-2 border-t border-amber-200 bg-amber-50 px-4 py-2 text-[11px] text-amber-900">
          <AlertTriangle className="h-3.5 w-3.5" />
          بیمار در معرض خطر تغذیه‌ای است — مداخله تغذیه‌ای و پایش منظم الزامی است.
        </div>
      ) : null}

      {result.search_sources?.length ? (
        <div className="border-t border-border bg-primary/5 px-4 py-2.5 text-[11px] leading-6 text-foreground">
          <p className="font-bold text-primary mb-1">
            گایدلاین‌ها و منابع بالینی استخراج‌شده (ESPEN / ASPEN / سرچ هوش مصنوعی):
          </p>
          <ul className="space-y-1">
            {result.search_sources.map((src, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10.5px] text-muted-foreground leading-5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span className="break-all">{src}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.sources?.length ? (
        <div className="border-t border-border px-4 py-2 text-[10px] leading-5 text-muted-foreground">
          <span className="font-semibold">منابع کتابخانه بیمارستان: </span>
          {result.sources.join(" · ")}
        </div>
      ) : null}
    </section>
  );
}
