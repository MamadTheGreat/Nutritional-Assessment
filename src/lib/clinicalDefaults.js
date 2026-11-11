export const DEFAULT_PROTOCOLS = [
  { name: "بیمار عمومی / بدون استرس", stress_factor: 25, protein_per_kg: 1.0, fluid_per_kg: 30, fluid_cap: 3000, notes: "نگهداری وزن، رژیم دهانی معمول" },
  { name: "بستری داخلی با استرس خفیف", stress_factor: 28, protein_per_kg: 1.2, fluid_per_kg: 30, fluid_cap: 3000, notes: "التهاب خفیف، بی‌حرکتی" },
  { name: "ICU / سپسیس", stress_factor: 30, protein_per_kg: 1.5, fluid_per_kg: 30, fluid_cap: 3000, notes: "پروتئین بالا؛ پایش ازت اوره" },
  { name: "بعد از جراحی بزرگ", stress_factor: 30, protein_per_kg: 1.5, fluid_per_kg: 30, fluid_cap: 2800, notes: "ترمیم زخم، شروع زودهنگام انترال" },
  { name: "سوختگی شدید (>20%)", stress_factor: 35, protein_per_kg: 2.0, fluid_per_kg: 32, fluid_cap: 4000, notes: "کاتابولیسم شدید، نیاز پروتئین حداکثری" },
  { name: "پانکراتیت حاد", stress_factor: 30, protein_per_kg: 1.5, fluid_per_kg: 32, fluid_cap: 3000, notes: "تغذیه روده‌ای زودهنگام، چربی محدود" },
  { name: "سیروز / نارسایی کبد", stress_factor: 35, protein_per_kg: 1.5, fluid_per_kg: 25, fluid_cap: 2000, notes: "محدودیت سدیم؛ پروتئین محدود نشود" },
  { name: "نارسایی کلیه (دیالیز)", stress_factor: 32, protein_per_kg: 1.2, fluid_per_kg: 25, fluid_cap: 1500, notes: "محدودیت پتاسیم/فسفر؛ مایع = دفع ادرار + ۵۰۰" },
  { name: "نارسایی کلیه (غیر دیالیزی)", stress_factor: 28, protein_per_kg: 0.8, fluid_per_kg: 25, fluid_cap: 1500, notes: "پروتئین محدود، انرژی کافی" },
  { name: "نارسایی قلب / ادم", stress_factor: 28, protein_per_kg: 1.2, fluid_per_kg: 25, fluid_cap: 1500, notes: "محدودیت سدیم و مایع" },
  { name: "COPD / نارسایی تنفسی", stress_factor: 30, protein_per_kg: 1.2, fluid_per_kg: 30, fluid_cap: 2500, notes: "رژیم پرچربی کم‌کربوهیدرات" },
  { name: "سرطان / کاشکسی", stress_factor: 30, protein_per_kg: 1.5, fluid_per_kg: 30, fluid_cap: 3000, notes: "مقاومت به انسولین، پروتئین بالا" },
  { name: "سوءتغذیه شدید (خطر بازتغذیه)", stress_factor: 20, protein_per_kg: 1.2, fluid_per_kg: 30, fluid_cap: 2500, notes: "شروع تدریجی؛ پایش فسفر و پتاسیم" },
  { name: "چاقی مرضی (BMI>35)", stress_factor: 25, protein_per_kg: 1.6, fluid_per_kg: 25, fluid_cap: 2500, notes: "محاسبه بر وزن تعدیل‌شده" },
  { name: "دیابت", stress_factor: 30, protein_per_kg: 1.2, fluid_per_kg: 30, fluid_cap: 3000, notes: "کنترل کربوهیدرات، فرمولای کم‌شاخص" },
  {
    name: "فشار خون بالا (DASH)",
    stress_factor: 25,
    protein_per_kg: 1.0,
    fluid_per_kg: 30,
    fluid_cap: 2500,
    notes: "DASH: سدیم <۲۳۰۰ mg (هدف ۱۵۰۰)، پتاسیم ۳۵۰۰–۵۰۰۰ mg، کلسیم ۱۰۰۰–۱۲۰۰ mg، منیزیم ۵۰۰ mg، فیبر ۳۰ g؛ هر ۱ kg کاهش وزن ≈ ۱ mmHg کاهش فشار",
    evidence: "ACC/AHA 2017 Hypertension Guideline + DASH trial (NEJM 2001)",
    source_url: "https://doi.org/10.1161/HYP.0000000000000065",
  },
  {
    name: "بیماری قلبی–عروقی (پیشگیری ثانویه)",
    stress_factor: 25,
    protein_per_kg: 1.2,
    fluid_per_kg: 28,
    fluid_cap: 2000,
    notes: "چربی اشباع <۷٪ انرژی و ترانس صفر، امگا-۳ EPA+DHA ≥۱ g/روز، سدیم <۲ g، فیبر ۲۵–۳۰ g؛ در نارسایی قلب محدودیت مایع و پایش وزن روزانه",
    evidence: "ESC 2021 CVD Prevention Guideline + AHA/ACC Secondary Prevention",
    source_url: "https://doi.org/10.1093/eurheartj/ehab484",
  },
  {
    name: "کله سیستیت حاد",
    stress_factor: 28,
    protein_per_kg: 1.3,
    fluid_per_kg: 30,
    fluid_cap: 2800,
    notes: "فاز حاد و درد شدید: NPO و مایع وریدی؛ سپس رژیم کم‌چرب (چربی <۳۰٪ انرژی، ترجیح MCT) با پیشرفت سریع؛ پس از کوله‌سیستکتومی محدودیت چربی طولانی‌مدت لازم نیست",
    evidence: "Tokyo Guidelines 2018 (TG18) + ESPEN guideline on clinical nutrition in surgery",
    source_url: "https://doi.org/10.1002/jhbp.518",
  },
];

// فرمولاهای گاواژ موجود در بازار ایران — مقادیر بر پایه برچسب محصول و برگه راهنمای سازنده (kcal/ml و گرم پروتئین در ۱۰۰ میلی‌لیتر)
export const DEFAULT_FORMULAS = [
  {
    name: "انترامیل استاندارد",
    manufacturer: "کارن (ایران)",
    kcal_per_ml: 1,
    protein_per_100ml: 3.5,
    category: "پلیمریک استاندارد",
    notes: "پودری: یک پیمانه (۱۱٫۳ گرم) با آب تا ۵۰ ml؛ ۱۴٪ انرژی از پروتئین وی، چربی نارگیل (MCT)، اینولین، کم‌لاکتوز — شروع استاندارد گاواژ",
  },
  {
    name: "انترامیل پرپروتئین (HN)",
    manufacturer: "کارن (ایران)",
    kcal_per_ml: 1.2,
    protein_per_100ml: 6,
    category: "پروتئین بالا",
    notes: "۲۰٪ انرژی از پروتئین؛ زخم فشاری، ICU، سوختگی، ترمیم بافت و تروما",
  },
  {
    name: "انترامیل پرفیبر",
    manufacturer: "کارن (ایران)",
    kcal_per_ml: 1,
    protein_per_100ml: 3.6,
    category: "فیبردار",
    notes: "فیبر محلول و نامحلول؛ یبوست و اسهال مرتبط با تغذیه لوله‌ای، بیمار بی‌حرکت",
  },
  {
    name: "انترامیل دیابتی",
    manufacturer: "کارن (ایران)",
    kcal_per_ml: 1,
    protein_per_100ml: 4.2,
    category: "دیابت",
    notes: "کربوهیدرات کم‌شاخص با فیبر؛ دیابت و هایپرگلایسمی استرسی",
  },
  {
    name: "پپتامن",
    manufacturer: "نستله ایران",
    kcal_per_ml: 1,
    protein_per_100ml: 4,
    category: "پپتیدی",
    notes: "پروتئین هیدرولیزه، چربی MCT؛ سوءجذب، پانکراتیت، تغذیه پس‌پیلوریک و ژژونال — حاوی شیر و سویا",
  },
  {
    name: "محلول گاواژ بیمارستانی (دست‌ساز)",
    manufacturer: "تهیه در بیمارستان",
    kcal_per_ml: 1,
    protein_per_100ml: 3.2,
    category: "دست‌ساز",
    notes: "فرمول استاندارد ضوابط تغذیه بیمارستانی وزارت بهداشت؛ کم‌هزینه — رعایت بهداشت، مصرف حداکثر تا ۴ ساعت و پایش حجم باقی‌مانده معده",
  },
];

export const SEVERITY_OPTIONS = [
  { value: 0, label: "۰ — بدون استرس" },
  { value: 1, label: "۱ — بیماری مزمن با عارضه حاد / شکستگی هیپ / سیروز / دیالیز" },
  { value: 2, label: "۲ — جراحی بزرگ شکم / سکته مغزی / پنومونی شدید / بدخیمی خون" },
  { value: 3, label: "۳ — آسیب سر / پیوند مغز استخوان / ICU (APACHE>10)" },
];

export const INTAKE_OPTIONS = [
  { value: "none", label: "طبیعی" },
  { value: "mild", label: "کاهش خفیف (۷۵–۱۰۰٪)" },
  { value: "moderate", label: "کاهش متوسط (۵۰–۷۵٪)" },
  { value: "severe", label: "کاهش شدید (<۵۰٪ یا NPO)" },
];

// بخش بستری → فاصله پایش (روز)
export const WARD_OPTIONS = [
  { value: "icu", label: "بخش ویژه", reviewDays: 3 },
  { value: "general", label: "بخش عادی", reviewDays: 7 },
];

export const SOURCE_KINDS = [
  { value: "guideline", label: "گایدلاین" },
  { value: "textbook", label: "کتاب مرجع" },
  { value: "paper", label: "مقاله" },
  { value: "protocol", label: "پروتکل داخلی" },
  { value: "other", label: "سایر" },
];
