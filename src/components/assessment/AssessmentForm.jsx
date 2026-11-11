import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DictateButton from "@/components/assessment/DictateButton";
import LabImport from "@/components/assessment/LabImport";
import PersianDatePicker from "@/components/assessment/PersianDatePicker";
import { Field, Section } from "@/components/assessment/ui-bits";
import { getWeightLossPercent } from "@/lib/clinical";
import { CLINICAL_SIGNS_OPTIONS, GI_SYMPTOMS_OPTIONS } from "@/lib/intakeFields";

const Select = ({ value, onChange, children }) => (
  <select value={value ?? ""} onChange={onChange} className="h-10 w-full rounded-md border border-input bg-background px-3 text-[12px]">
    {children}
  </select>
);

function TextField({ value, setField, name, label, type = "text", placeholder, mic, step }) {
  const onDictation = type === "number" ? null : mic === false ? null : mic || appendText(value, setField, name);
  return (
    <Field label={label} action={onDictation ? <DictateButton compact onText={onDictation} /> : null}>
      <Input
        type={type}
        step={step}
        value={value[name] ?? ""}
        onChange={(event) => setField(name, type === "number" ? (event.target.value === "" ? null : Number(event.target.value)) : event.target.value)}
        placeholder={placeholder}
        className="h-10 text-[12px]"
      />
    </Field>
  );
}

function TextAreaField({ value, setField, name, label, mic, rows = 3 }) {
  const stored = Array.isArray(value[name]) ? value[name].join("\n") : value[name] || "";
  const onDictation = mic === false ? null : mic || appendText(value, setField, name);
  return (
    <Field label={label} action={onDictation ? <DictateButton onText={onDictation} /> : null}>
      <Textarea
        value={stored}
        onChange={(event) =>
          setField(name, Array.isArray(value[name]) ? event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) : event.target.value)
        }
        rows={rows}
        className="text-[12px] leading-6"
      />
    </Field>
  );
}

function appendText(value, setField, key) {
  return (spoken) => {
    if (spoken === "__unsupported__") return toast.error("دیکتهٔ گفتاری در این مرورگر پشتیبانی نمی‌شود.");
    setField(key, [value[key], spoken].filter(Boolean).join("، "));
  };
}

function MultiSelectField({ value, setField, name, label, options }) {
  const selected = Array.isArray(value[name]) ? value[name] : [];
  return (
    <Field label={label}>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex min-h-10 items-start gap-2 rounded-md border border-border px-2.5 py-2 text-[11px] leading-5">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) =>
                setField(name, event.target.checked ? [...selected, option] : selected.filter((item) => item !== option))
              }
              className="mt-1 h-4 w-4 shrink-0 accent-primary"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

export default function AssessmentForm({ value, setField, onSubmit, busy, protocols = [], patients = [], patientId, onPatientChange }) {
  const append = (key) => (spoken) => {
    if (spoken === "__unsupported__") return toast.error("دیکتهٔ گفتاری در این مرورگر پشتیبانی نمی‌شود.");
    setField(key, [value[key], spoken].filter(Boolean).join("، "));
  };
  const lossPercent = getWeightLossPercent(value);
  const hasWeightLoss = value.weight_loss_kg != null || value.usual_weight != null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-3"
    >
      <Section title="مشخصات بیمار" step="۱">
        <div className="grid grid-cols-2 gap-3">
          <Field label="انتخاب پروندهٔ قبلی" className="col-span-2">
            <Select value={patientId || ""} onChange={(event) => onPatientChange?.(event.target.value)}>
              <option value="">بیمار جدید / انتخاب نشده</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                  {patient.file_number ? ` — ${patient.file_number}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <TextField value={value} setField={setField} name="patient_name" label="نام بیمار *" />
          <TextField value={value} setField={setField} name="file_number" label="شماره پرونده" />
          <TextField value={value} setField={setField} name="father_name" label="نام پدر" />
          <PersianDatePicker label="تاریخ تولد" value={value.birth_date} onChange={(date) => setField("birth_date", date)} />
          <TextField value={value} setField={setField} name="age" label="سن" type="number" />
          <Field label="جنسیت">
            <Select value={value.sex} onChange={(event) => setField("sex", event.target.value)}>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </Select>
          </Field>
          <Field label="بخش">
            <Select value={value.ward_type} onChange={(event) => setField("ward_type", event.target.value)}>
              <option value="general">بخش عادی</option>
              <option value="icu">بخش ویژه / ICU</option>
            </Select>
          </Field>
          <TextField value={value} setField={setField} name="ward" label="نام بخش" />
          <TextField value={value} setField={setField} name="room" label="اتاق" />
          <TextField value={value} setField={setField} name="bed" label="تخت" />
          <TextField value={value} setField={setField} name="physician" label="پزشک" />
          <PersianDatePicker label="تاریخ پذیرش" value={value.admission_date} onChange={(date) => setField("admission_date", date)} />
        </div>
      </Section>

      <Section title="ارزیابی تن‌سنجی" step="۲">
        <div className="grid grid-cols-2 gap-3">
          <TextField value={value} setField={setField} name="weight" label="وزن فعلی (kg) *" type="number" step="0.1" />
          <TextField value={value} setField={setField} name="height" label="قد (cm) *" type="number" step="0.1" />
          <TextField value={value} setField={setField} name="usual_weight" label="وزن معمول (kg)" type="number" step="0.1" />
          <TextField value={value} setField={setField} name="weight_loss_kg" label="مقدار کاهش وزن (kg)" type="number" step="0.1" />
          <TextField value={value} setField={setField} name="mac" label="دور بازو (cm)" type="number" step="0.1" />
          <TextField value={value} setField={setField} name="skinfold" label="چین پوستی (mm)" type="number" step="0.1" />
          <TextField value={value} setField={setField} name="weight_change_duration" label="مدت تغییر وزن" />
        </div>
        {hasWeightLoss && value.weight ? (
          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
            کاهش وزن برآوردشده برای محاسبه NRS: {lossPercent.toLocaleString("fa-IR")}٪
          </p>
        ) : null}
      </Section>

      <Section title="شرح حال و دریافت غذایی" step="۳">
        <div className="space-y-3">
          <TextAreaField value={value} setField={setField} name="primary_disease" label="بیماری اصلی" mic={append("primary_disease")} />
          <TextAreaField value={value} setField={setField} name="underlying_disease" label="بیماری‌های زمینه‌ای" mic={append("underlying_disease")} />
          <TextAreaField value={value} setField={setField} name="prescribed_medications" label="داروهای تجویز شده توسط پزشک" mic={append("prescribed_medications")} />
          <TextAreaField value={value} setField={setField} name="medication_history" label="سابقه داروهای مصرفی" mic={append("medication_history")} />
          <TextAreaField value={value} setField={setField} name="diet_history" label="شرح دریافت غذایی" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="کاهش دریافت غذایی">
              <Select value={value.intake_reduction} onChange={(event) => setField("intake_reduction", event.target.value)}>
                <option value="none">ندارد</option>
                <option value="mild">خفیف</option>
                <option value="moderate">متوسط</option>
                <option value="severe">شدید</option>
              </Select>
            </Field>
            <Field label="شدت بیماری">
              <Select value={value.disease_severity} onChange={(event) => setField("disease_severity", Number(event.target.value))}>
                <option value={0}>بدون استرس</option>
                <option value={1}>خفیف</option>
                <option value={2}>متوسط</option>
                <option value={3}>شدید</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField value={value} setField={setField} name="allergy" label="حساسیت‌ها" />
            <TextField value={value} setField={setField} name="diet_order" label="دستور رژیم" />
            <Field label="مسیر تغذیه">
              <Select value={value.nutrition_route} onChange={(event) => setField("nutrition_route", event.target.value)}>
                <option value="">انتخاب کنید</option>
                <option value="تغذیه دهانی">تغذیه دهانی</option>
                <option value="منع تغذیه با دهان">منع تغذیه با دهان</option>
                <option value="تغذیه وریدی">تغذیه وریدی</option>
                <option value="تغذیه با لوله">تغذیه با لوله</option>
              </Select>
            </Field>
          </div>
        </div>
      </Section>

      <Section title="پروتکل و وضعیت بالینی" step="۴">
        <div className="space-y-3">
          <Field label="پروتکل محاسبه">
            <Select value={value.protocol_id} onChange={(event) => setField("protocol_id", event.target.value)}>
              {protocols.map((protocol) => (
                <option key={protocol.id} value={protocol.id}>
                  {protocol.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-[12px]">
              <input type="checkbox" checked={Boolean(value.fever)} onChange={(event) => setField("fever", event.target.checked)} /> تب
            </label>
            <label className="flex items-center gap-2 text-[12px]">
              <input type="checkbox" checked={Boolean(value.drain)} onChange={(event) => setField("drain", event.target.checked)} /> درناژ
            </label>
          </div>
          <MultiSelectField value={value} setField={setField} name="clinical_signs" label="وضعیت بالینی" options={CLINICAL_SIGNS_OPTIONS} />
          <MultiSelectField value={value} setField={setField} name="gi_symptoms" label="مشکلات گوارشی و غذایی" options={GI_SYMPTOMS_OPTIONS} />
        </div>
      </Section>

      <Section title="آزمایش‌ها" step="۵">
        <div className="space-y-3">
          <LabImport onExtracted={(text) => setField("abnormal_labs", [value.abnormal_labs, text].filter(Boolean).join("\n"))} />
          <TextAreaField value={value} setField={setField} name="abnormal_labs" label="مقادیر آزمایش (قابل اصلاح پس از استخراج)" rows={6} />
        </div>
      </Section>

      <button
        type="submit"
        disabled={busy || !value.weight || !value.height}
        className="sticky bottom-20 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground shadow-sm disabled:opacity-40 md:bottom-4"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "در حال تحلیل و ارزیابی هوش مصنوعی…" : "محاسبه و ارزیابی هوشمند"}
      </button>
    </form>
  );
}
