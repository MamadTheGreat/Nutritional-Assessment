export const CLINICAL_SIGNS_OPTIONS = [
  "تحلیل عضلانی مشهود",
  "کاهش چربی زیر جلدی",
  "ادم",
  "آسیت",
  "تغییرات مو و پوست و ناخن",
  "ضعف یا لرزش",
];

export const GI_SYMPTOMS_OPTIONS = [
  "تهوع",
  "استفراغ",
  "اسهال",
  "ریفلاکس",
  "کاهش مصرف یا بی‌اشتهایی طی هفته‌های گذشته",
  "یبوست",
  "اختلال بلع و جویدن غذا",
  "مشکلات دهانی یا دندانی یا دندان مصنوعی",
];

export const INTAKE_FIELD_LABELS = {
  patient_name: "نام بیمار",
  file_number: "شماره پرونده",
  father_name: "نام پدر",
  birth_date: "تاریخ تولد",
  age: "سن",
  sex: "جنسیت",
  ward_type: "بخش",
  ward: "نام بخش",
  room: "اتاق",
  bed: "تخت",
  physician: "پزشک",
  admission_date: "تاریخ پذیرش",
  weight: "وزن فعلی",
  height: "قد",
  usual_weight: "وزن معمول",
  weight_loss_kg: "مقدار کاهش وزن",
  mac: "دور بازو",
  skinfold: "چین پوستی",
  weight_change_duration: "مدت تغییر وزن",
  primary_disease: "بیماری اصلی",
  underlying_disease: "بیماری‌های زمینه‌ای",
  prescribed_medications: "داروهای تجویز شده توسط پزشک",
  medication_history: "سابقه داروهای مصرفی",
  diet_history: "شرح دریافت غذایی",
  intake_reduction: "کاهش دریافت غذایی",
  disease_severity: "شدت بیماری",
  allergy: "حساسیت‌ها",
  diet_order: "دستور رژیم",
  nutrition_route: "مسیر تغذیه",
  clinical_signs: "وضعیت بالینی",
  gi_symptoms: "مشکلات گوارشی و غذایی",
  fever: "تب",
  drain: "درناژ",
  abnormal_labs: "مقادیر آزمایش",
};

export const INTAKE_SINGLE_OPTIONS = {
  sex: ["male", "female"],
  ward_type: ["general", "icu"],
  intake_reduction: ["none", "mild", "moderate", "severe"],
  nutrition_route: ["تغذیه دهانی", "منع تغذیه با دهان", "تغذیه وریدی", "تغذیه با لوله"],
};

export const INTAKE_MULTI_OPTIONS = {
  clinical_signs: CLINICAL_SIGNS_OPTIONS,
  gi_symptoms: GI_SYMPTOMS_OPTIONS,
};

export const INTAKE_STRING_FIELDS = [
  "patient_name",
  "file_number",
  "father_name",
  "ward",
  "room",
  "bed",
  "physician",
  "primary_disease",
  "underlying_disease",
  "prescribed_medications",
  "medication_history",
  "diet_history",
  "allergy",
  "diet_order",
  "abnormal_labs",
  "weight_change_duration",
];

export const INTAKE_NUMBER_FIELDS = ["age", "weight", "height", "usual_weight", "weight_loss_kg", "mac", "skinfold", "disease_severity"];
export const INTAKE_DATE_FIELDS = ["birth_date", "admission_date"];
export const INTAKE_OTHER_FIELDS = ["sex", "ward_type", "intake_reduction", "nutrition_route", "clinical_signs", "gi_symptoms", "fever", "drain"];
