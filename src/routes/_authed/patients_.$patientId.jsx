import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Activity, ChevronDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import AssessmentResult from "@/components/assessment/AssessmentResult";
import { PageHead } from "@/components/assessment/ui-bits";
import { formatJalaliDate } from "@/lib/jalali";
import { getPatient, patientAssessments } from "@/lib/server-fns";
import { reviewLabel } from "@/lib/reviewDates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/patients_/$patientId")({
  head: () => ({ meta: [{ title: "پرونده بیمار | دستیار بالین" }] }),
  loader: async ({ params }) => {
    const [patient, assessments] = await Promise.all([
      getPatient({ data: { id: params.patientId } }),
      patientAssessments({ data: { patientId: params.patientId } }),
    ]);
    if (!patient) throw notFound();
    return { patient, assessments };
  },
  component: PatientPage,
});

const d = (value) => new Date(value).toLocaleDateString("fa-IR", { year: "2-digit", month: "2-digit", day: "2-digit" });

function PatientPage() {
  const { patient, assessments } = Route.useLoaderData();
  const [openId, setOpenId] = useState(null);
  const chronological = [...assessments].reverse();
  const latest = assessments[0];

  return (
    <div>
      <PageHead
        title={patient.full_name}
        subtitle={[
          patient.file_number && `پرونده ${patient.file_number}`,
          patient.father_name && `نام پدر: ${patient.father_name}`,
          patient.birth_date && `تولد ${formatJalaliDate(patient.birth_date)}`,
          patient.age && `${patient.age} سال`,
          patient.sex === "female" ? "زن" : patient.sex === "male" ? "مرد" : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        right={
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Link
              to="/"
              search={{ patient: patient.id }}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[10.5px] font-semibold text-primary-foreground"
            >
              <RefreshCw className="h-3 w-3" />
              پایش مجدد
            </Link>
            <span className="num rounded-md border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">
              {patient.ward_type === "icu" ? "بخش ویژه" : "بخش عادی"} ·{" "}
              {patient.next_review_date ? `پایش ${reviewLabel(patient.next_review_date)}` : "بدون موعد"}
            </span>
            {latest ? (
              <span className="num text-[10px] text-muted-foreground">آخرین: {d(latest.created_date)}</span>
            ) : null}
          </div>
        }
      />

      {assessments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-[12.5px] text-muted-foreground">
          هنوز ارزیابی‌ای ثبت نشده است
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-6 gap-1 border-b border-border bg-secondary/50 px-3 py-2 text-[10px] font-semibold text-muted-foreground">
              <span>تاریخ</span>
              <span>وزن</span>
              <span>BMI</span>
              <span>kcal</span>
              <span>پروتئین</span>
              <span>NRS</span>
            </div>
            {chronological.map((a) => (
              <div key={a.id} className="num grid grid-cols-6 gap-1 border-b border-border px-3 py-2 text-[11px] last:border-b-0">
                <span className="text-muted-foreground">{d(a.created_date)}</span>
                <span>{a.weight ?? "—"}</span>
                <span>{a.bmi ?? "—"}</span>
                <span>{a.calorie_target ?? "—"}</span>
                <span>{a.protein_target ?? "—"}</span>
                <span className={cn(a.nrs_score >= 3 ? "font-semibold text-amber-700" : "text-muted-foreground")}>
                  {a.nrs_score ?? "—"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              تاریخچه ارزیابی‌ها
            </div>
            {assessments.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                  className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-right"
                >
                  <div className="min-w-0">
                    <p className="num text-[12px] font-semibold">{d(a.created_date)}</p>
                    <p className="truncate text-[10.5px] text-muted-foreground">
                      {a.primary_disease || "—"} · {a.protocol_name || "عمومی"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", openId === a.id && "rotate-180")}
                  />
                </button>
                {openId === a.id && a.result ? (
                  <div className="border-t border-border p-2">
                    <AssessmentResult result={a.result} protocolName={a.protocol_name} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
