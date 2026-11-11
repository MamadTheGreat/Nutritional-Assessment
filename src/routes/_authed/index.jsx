import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Download, Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import AssessmentResult from "@/components/assessment/AssessmentResult";
import AiProgressCard from "@/components/assessment/AiProgressCard";
import { PageHead } from "@/components/assessment/ui-bits";
import ReviewDue from "@/components/patients/ReviewDue";
import { useAuth } from "@/lib/AuthContext";
import { buildAssessmentJson, downloadJsonFile, exportFileName } from "@/lib/assessmentExport";
import {
  buildPlan,
  dueReviews,
  listPatients,
  listProtocols,
  saveAssessment,
} from "@/lib/server-fns";
import { getWeightLossPercent } from "@/lib/clinical";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "ارزیابی تغذیه | دستیار بالین" }] }),
  validateSearch: (search) => (search.patient ? { patient: String(search.patient) } : {}),
  loader: async () => {
    const [patients, protocols, due] = await Promise.all([
      listPatients({ data: {} }),
      listProtocols(),
      dueReviews(),
    ]);
    return { patients, protocols, due };
  },
  component: AssessmentPage,
});

const EMPTY = {
  patient_name: "",
  file_number: "",
  age: null,
  sex: "male",
  ward_type: "general",
  primary_disease: "",
  underlying_disease: "",
  prescribed_medications: "",
  medication_history: "",
  weight: null,
  height: null,
  usual_weight: null,
  weight_loss_kg: null,
  intake_reduction: "none",
  disease_severity: 0,
  abnormal_labs: "",
  fever: false,
  drain: false,
  protocol_id: "",
  national_id: "",
  ward: "",
  room: "",
  bed: "",
  physician: "",
  father_name: "",
  birth_date: "",
  admission_date: "",
  activity_level: "",
  allergy: "",
  diet_order: "",
  nutrition_route: "",
  mac: null,
  skinfold: null,
  clinical_signs: [],
  gi_symptoms: [],
  diet_history: "",
  weight_change_duration: "",
};

function AssessmentPage() {
  const { patients, protocols, due } = Route.useLoaderData();
  const { patient: presetId } = Route.useSearch();
  const router = useRouter();
  const resultRef = useRef(null);

  const defaultProtocol = protocols.find((p) => p.name.includes("بیمار عمومی")) || protocols[0];
  const [form, setForm] = useState({ ...EMPTY, protocol_id: defaultProtocol?.id || "" });
  const [patientId, setPatientId] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const preset = patients.find((p) => p.id === presetId);

  // پایش مجدد از روی پرونده بیمار
  useEffect(() => {
    if (!preset) return;
    setPatientId(preset.id);
    setForm((prev) => ({
      ...prev,
      patient_name: preset.full_name || "",
      file_number: preset.file_number || "",
      age: preset.age ?? null,
      sex: preset.sex || "male",
      ward_type: preset.ward_type || "general",
      father_name: preset.father_name || "",
      birth_date: preset.birth_date || "",
    }));
  }, [preset?.id]);

  const protocol = useMemo(
    () => protocols.find((p) => p.id === form.protocol_id) || protocols[0],
    [protocols, form.protocol_id],
  );

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function selectPatient(id) {
    const patient = patients.find((item) => item.id === id);
    setPatientId(patient?.id || "");
    if (!patient) return;
    setForm((previous) => ({
      ...previous,
      patient_name: patient.full_name || "",
      file_number: patient.file_number || "",
      age: patient.age ?? null,
      sex: patient.sex || "male",
      ward_type: patient.ward_type || "general",
      father_name: patient.father_name || "",
      birth_date: patient.birth_date || "",
    }));
  }

  const payload = () =>
    buildAssessmentJson({ form, result, protocol, patientId, dietitianName: user?.full_name });

  async function compute() {
    setBusy(true);
    try {
      const data = await buildPlan({
        data: {
          ...form,
          weight_loss_percent: getWeightLossPercent(form),
          protocol_name: protocol?.name,
          stress_factor: protocol?.stress_factor,
          protein_per_kg: protocol?.protein_per_kg,
          fluid_per_kg: protocol?.fluid_per_kg,
          fluid_cap: protocol?.fluid_cap,
        },
      });
      setResult(data);
      if (data.ai_error) toast.error(data.ai_error);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) {
      toast.error(error?.message || "محاسبه انجام نشد؛ دوباره تلاش کنید");
    } finally {
      setBusy(false);
    }
  }

  async function persist() {
    if (!result) return;
    if (!form.patient_name.trim()) {
      toast.error("برای ذخیره، نام بیمار را وارد کنید.");
      return;
    }
    setSaving(true);
    try {
      const name = form.patient_name.trim();
      const saved = await saveAssessment({
        data: {
          ...form,
          patient_name: name,
          weight_loss_percent: getWeightLossPercent(form),
          patient_id: patientId || undefined,
          protocol_id: protocol?.id,
          protocol_name: protocol?.name,
          bmi: result.bmiValue,
          ideal_weight: result.ibw,
          nrs_score: result.nrs.total,
          nrs_level: result.nrs.level,
          calorie_target: result.calorie,
          protein_target: result.protein,
          fluid_target: result.fluid,
          result,
          record_note: result.record_note,
        },
      });
      setPatientId(saved.patient_id);
      toast.success("ویزیت در پرونده بیمار ذخیره شد و موعد پیگیری به‌روز شد.");
      router.invalidate();
    } catch (error) {
      toast.error(error?.message || "ذخیره در Google Drive انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  function downloadJson() {
    downloadJsonFile(payload(), exportFileName());
    toast.success("فایل JSON ساخته شد");
  }

  return (
    <div>
      <PageHead title="ارزیابی تغذیه" subtitle="چهار ورودی — خروجی ۱۰ بندی بالینی" />

      <ReviewDue patients={due} />

      {busy ? <AiProgressCard /> : null}

      {result ? (
        <div ref={resultRef} className="mb-4 space-y-2 scroll-mt-4">
          <AssessmentResult result={result} protocolName={protocol?.name} />

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={downloadJson}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" />
              دانلود JSON
            </button>
          </div>

          <button
            type="button"
            onClick={persist}
            disabled={saving || !form.patient_name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "در حال ذخیره…" : form.patient_name.trim() ? "ذخیره در پرونده بیمار" : "برای ذخیره، نام بیمار لازم است"}
          </button>
        </div>
      ) : null}

      <AssessmentForm
        value={form}
        setField={setField}
        onSubmit={compute}
        busy={busy}
        protocols={protocols}
        patients={patients}
        patientId={patientId}
        onPatientChange={selectPatient}
      />
    </div>
  );
}
