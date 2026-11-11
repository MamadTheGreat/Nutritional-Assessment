import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Droplets, Gauge, Package, Timer } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, PageHead, Section } from "@/components/assessment/ui-bits";
import { fmt, gavagePlan } from "@/lib/clinical";
import { listFormulas, listPatients, patientAssessments } from "@/lib/server-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/icu")({
  head: () => ({ meta: [{ title: "محاسبه‌گر گاواژ ICU | دستیار بالین" }] }),
  loader: async () => {
    const [patients, formulas] = await Promise.all([listPatients({ data: {} }), listFormulas()]);
    return { patients, formulas };
  },
  component: IcuPage,
});

function Stat({ icon: Icon, label, value, unit, tone }) {
  return (
    <div className="rounded-lg border border-border bg-card p-2.5">
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className={cn("num mt-1 text-[17px] font-bold leading-none", tone)}>
        {value}
        {unit ? <span className="mr-1 text-[10px] font-medium text-muted-foreground">{unit}</span> : null}
      </p>
    </div>
  );
}

function IcuPage() {
  const { patients, formulas } = Route.useLoaderData();
  const loadAssessments = patientAssessments;

  const [patientId, setPatientId] = useState("");
  const [kcalTarget, setKcalTarget] = useState(null);
  const [proteinTarget, setProteinTarget] = useState(null);
  const [formulaId, setFormulaId] = useState(formulas[0]?.id || "manual");
  const [manual, setManual] = useState({ name: "فرمول دستی", kcal_per_ml: 1, protein_per_100ml: 4 });
  const [hours, setHours] = useState(20);
  const [feeds, setFeeds] = useState(4);

  const formula = useMemo(() => {
    if (formulaId === "manual") return manual;
    return formulas.find((f) => f.id === formulaId);
  }, [formulaId, formulas, manual]);

  const plan = useMemo(
    () => gavagePlan({ kcalTarget, proteinTarget: proteinTarget || 0, formula, hours, feeds }),
    [kcalTarget, proteinTarget, formula, hours, feeds],
  );

  async function pickPatient(id) {
    setPatientId(id);
    const list = await loadAssessments({ data: { patientId: id } });
    const latest = list?.[0];
    if (latest) {
      setKcalTarget(latest.calorie_target ?? null);
      setProteinTarget(latest.protein_target ?? null);
    }
  }

  const coverage = proteinTarget ? Math.round((plan.proteinProvided / proteinTarget) * 100) : null;

  return (
    <div>
      <PageHead title="محاسبه‌گر گاواژ ICU" subtitle="حجم، نرخ انفوزیون و برنامه بولوس" />

      <div className="space-y-3">
        <Section title="بیمار و هدف روزانه">
          <div className="space-y-3">
            <Field label="بیمار (هدف از آخرین ارزیابی)">
              <Select value={patientId} onValueChange={pickPatient}>
                <SelectTrigger className="h-9 text-[12px]">
                  <SelectValue placeholder="انتخاب بیمار" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-[12px]">
                      {p.full_name}
                      {p.file_number ? ` — ${p.file_number}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="هدف انرژی (kcal)">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={kcalTarget ?? ""}
                  onChange={(e) => setKcalTarget(e.target.value === "" ? null : Number(e.target.value))}
                  className="h-9 num"
                />
              </Field>
              <Field label="هدف پروتئین (g)">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={proteinTarget ?? ""}
                  onChange={(e) => setProteinTarget(e.target.value === "" ? null : Number(e.target.value))}
                  className="h-9 num"
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="فرمولا و روش تغذیه">
          <div className="space-y-3">
            <Field label="فرمولا">
              <Select value={formulaId} onValueChange={setFormulaId}>
                <SelectTrigger className="h-9 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formulas.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-[12px]">
                      {f.name} — {f.kcal_per_ml} kcal/ml · {f.protein_per_100ml} g/100ml
                    </SelectItem>
                  ))}
                  <SelectItem value="manual" className="text-[12px]">
                    ورود دستی
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {formulaId === "manual" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="kcal/ml">
                  <Input
                    type="number"
                    step="0.1"
                    value={manual.kcal_per_ml}
                    onChange={(e) => setManual({ ...manual, kcal_per_ml: Number(e.target.value) })}
                    className="h-9 num"
                  />
                </Field>
                <Field label="پروتئین g/100ml">
                  <Input
                    type="number"
                    step="0.1"
                    value={manual.protein_per_100ml}
                    onChange={(e) => setManual({ ...manual, protein_per_100ml: Number(e.target.value) })}
                    className="h-9 num"
                  />
                </Field>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Field label="ساعت انفوزیون در روز">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="h-9 num"
                />
              </Field>
              <Field label="تعداد نوبت بولوس">
                <Select value={String(feeds)} onValueChange={(v) => setFeeds(Number(v))}>
                  <SelectTrigger className="h-9 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 6, 8].map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-[12px]">
                        {n} نوبت
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </Section>

        {kcalTarget ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Stat icon={Package} label="حجم کل روزانه" value={fmt(plan.volume)} unit="ml" />
              <Stat icon={Gauge} label="نرخ انفوزیون" value={fmt(plan.rate, 1)} unit="ml/h" />
              <Stat icon={Timer} label={`بولوس هر ${plan.interval} ساعت`} value={fmt(plan.perFeed)} unit="ml" />
              <Stat icon={Droplets} label="آب آزاد (شست‌وشو)" value={fmt(plan.freeWater)} unit="ml" />
            </div>

            <div
              className={cn(
                "rounded-lg border px-3 py-2.5 text-[11.5px] leading-6",
                coverage != null && coverage < 90
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900",
              )}
            >
              <p className="num font-semibold">
                پروتئین تأمین‌شده: {fmt(plan.proteinProvided, 1)} g از هدف {fmt(proteinTarget)} g
                {coverage != null ? ` (${coverage}٪)` : ""}
              </p>
              {coverage != null && coverage < 90 ? (
                <p className="mt-1 flex items-start gap-1.5">
                  <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" />
                  کمبود {fmt(plan.proteinGap, 1)} g پروتئین — افزودن ماژول پروتئین (پودر پروتئین whey) یا فرمولای پرپروتئین.
                </p>
              ) : null}
            </div>

            <p className="num rounded-lg bg-muted px-3 py-2 text-[10.5px] text-muted-foreground">
              {formula?.name} · {formula?.kcal_per_ml} kcal/ml · {formula?.protein_per_100ml} g/100ml — در {hours} ساعت با {feeds} نوبت
            </p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-[12px] text-muted-foreground">
            بیمار را انتخاب کنید یا هدف انرژی را وارد کنید
          </p>
        )}
      </div>
    </div>
  );
}
