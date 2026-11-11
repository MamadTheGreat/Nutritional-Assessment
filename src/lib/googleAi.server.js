import { env } from "cloudflare:workers";
import { GoogleGenAI } from "@google/genai";

const jsonResponse = (body, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

async function authorizeGoogleRequest(request) {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { error: "نشست گوگل معتبر نیست.", status: 401 };
  const responsePromise = fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const response = await responsePromise.catch(() => null);
  if (!response) return { error: "ارتباط با سرویس بررسی حساب گوگل برقرار نشد.", status: 502 };
  if (!response.ok) return { error: "نشست گوگل معتبر نیست.", status: 401 };
  const profile = await response.json();
  if (!profile.email_verified || !profile.email) {
    return { error: "حساب گوگل تأیید نشده است.", status: 403 };
  }
  return null;
}

function parseModelJson(content) {
  if (!content || typeof content !== "string") throw new Error("Empty AI response");
  const clean = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    const match = clean.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!match) throw new Error("JSON parse failure");
    return JSON.parse(match[0]);
  }
}

// Resilient models: gemini-3.1-flash-lite is lightning fast and supports multimodal vision without 503 spikes
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
];

async function callGemini({ contents, systemInstruction, enableSearch = false, maxOutputTokens = 3000 }) {
  const apiKey = (
    (typeof env !== "undefined" && env?.GEMINI_API_KEY) ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ""
  )?.trim();

  if (!apiKey) {
    return {
      error: "کلید ارتباط با هوش مصنوعی در سرور یافت نشد. لطفاً صفحه را رفرش کنید یا دوباره وارد شوید.",
      status: 503,
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" }, timeout: 35000 },
  });

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config = {
        systemInstruction,
        maxOutputTokens,
      };

      if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = "application/json";
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });

      const text = response.text;
      if (text) {
        let searchSources = [];
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (Array.isArray(chunks)) {
          searchSources = chunks
            .filter((c) => c.web?.title)
            .map((c) => `${c.web.title}${c.web.uri ? ` (${c.web.uri})` : ""}`);
        }

        return { text, rawResponse: response, searchSources, modelUsed: model };
      }
    } catch (err) {
      console.warn(`Model ${model} attempt failed:`, err?.message || err);
      lastError = err;
      // If 503 or 504 or 429, continue to next model in list
      continue;
    }
  }

  return {
    error: lastError?.message || "پاسخ از سرویس هوش مصنوعی دریافت نشد. لطفاً لحظاتی بعد تلاش کنید.",
    status: 502,
  };
}

const planSchema = (value, searchSources = []) => ({
  required_labs: Array.isArray(value?.required_labs) ? value.required_labs.slice(0, 8).map(String) : [],
  supplement: typeof value?.supplement === "string" ? value.supplement.slice(0, 1500) : "",
  drug_interactions: Array.isArray(value?.drug_interactions) ? value.drug_interactions.slice(0, 6).map(String) : [],
  diet_principles: Array.isArray(value?.diet_principles) ? value.diet_principles.slice(0, 6).map(String) : [],
  record_note: typeof value?.record_note === "string" ? value.record_note.slice(0, 5000) : "",
  search_sources: Array.isArray(value?.search_sources) && value.search_sources.length
    ? value.search_sources.slice(0, 8).map(String)
    : searchSources.slice(0, 8),
});

function generateClinicalPlanFallback(data) {
  const isIcu = data.ward_type === "icu";
  const primary = data.primary_disease || "بیماری جاری";
  const labs = ["CBC (Hb, WBC, Plt)", "BUN / Cr (عملکرد کلیه)", "Na, K, P, Mg (الکترولیت‌ها)", "Albumin / Prealbumin", "FBS / Blood Sugar"];
  if (isIcu) labs.push("ABG / گازهای خون شریانی", "Triglyceride", "LFT (AST, ALT, Bilirubin)");

  const principles = [
    `هدف انرژی محاسبه‌شده: ${data.calculated?.calorie || 2000} کیلوکالری در روز (آغاز با ۶۰-۷۰٪ در ۲۴-۴۸ ساعت اول جهت پیشگیری از ریفیدینگ).`,
    `هدف پروتئین: ${data.calculated?.protein || 85} گرم در روز جهت حفظ توده عضلانی و ترمیم بافت‌ها (بر پایه راهنمای ESPEN).`,
    `تأمین مایعات روزانه: ${data.calculated?.fluid || 2400} میلی‌لیتر با پایش برون‌ده ادراری و الکترولیت‌ها.`,
    isIcu
      ? "پایش قند خون هر ۴ تا ۶ ساعت (هدف گلیسمی ۱۴۰-۱۸۰ mg/dL) و کنترل حجم باقیمانده معده (GRV) در تغذیه انترال."
      : "توزیع پروتئین و کالری در وعده‌ها و میان‌وعده‌های متراکم و کم‌حجم بر حسب تحمل گوارشی بیمار.",
  ];

  const interactions = [];
  const meds = String(data.prescribed_medications || "").toLowerCase();
  if (/وارفارین|warfarin/.test(meds)) interactions.push("وارفارین: تداخل با ویتامین K و لزوم ثبات در مصرف سبزیجات تیره؛ پایش منظم INR.");
  if (/لووتیروکسین|levothyroxine/.test(meds)) interactions.push("لووتیروکسین: مصرف با معده خالی، با فاصله حداقل ۱ ساعت از غذا و مکمل‌های کلسیم یا آهن.");
  if (/فنی\s*توئین|phenytoin/.test(meds)) interactions.push("فنی‌توئین: قطع گاواژ لوله‌ای ۱ تا ۲ ساعت قبل و بعد از تجویز دارو.");
  if (/متفورمین|metformin/.test(meds)) interactions.push("متفورمین: همراه غذا جهت کاهش عوارض گوارشی؛ پایش سطح ویتامین B12.");
  if (/کورتون|پردنیزولون|دگزامتازون|هیدروکورتیزون|prednisolone|dexamethasone/.test(meds)) {
    interactions.push("کورتیکواستروئیدها: پایش قند خون و احتباس سدیم و مایعات؛ تنظیم نمک در صورت ادم.");
  }
  if (!interactions.length) {
    interactions.push("داروهای فعلی نیاز به تنظیم زمان‌بندی نسبت به وعده‌های غذایی و پایش الکترولیت‌ها دارند.");
  }

  const supplement = isIcu
    ? "بر اساس راهنمای ESPEN ICU: مکمل مولتی‌ویتامین و عناصر کمیاب (روی، سلنیوم، ویتامین C و ویتامین‌های گروه B به ویژه تیامین ۱۰۰ میلی‌گرم جهت پیشگیری از سندرم ریفیدینگ) توصیه می‌شود."
    : "مکمل مولتی‌ویتامین مینرال روزانه به همراه مکمل پروتئینی خوراکی (ONS) متناسب با تحمل بیمار.";

  const recordNote = `مشاوره تغذیه بالینی:\nبیمار ${data.age || "—"} ساله با وزن ${data.weight || "—"} kg، قد ${data.height || "—"} cm و BMI: ${data.calculated?.bmiValue || "—"} (${data.calculated?.bmiLabel || "—"}). امتیاز غربالگری تغذیه NRS-2002 برابر با ${data.calculated?.nrs?.totalScore ?? data.calculated?.nrs?.total ?? "—"}. با توجه به تشخیص (${primary})، اهداف روزانه ${data.calculated?.calorie || "—"} kcal انرژی و ${data.calculated?.protein || "—"} g پروتئین تنظیم شد. پایش روزانه تحمل گوارشی و آزمایش‌های الکترولیت توصیه می‌گردد.`;

  return {
    required_labs: labs.slice(0, 6),
    supplement,
    drug_interactions: interactions.slice(0, 4),
    diet_principles: principles.slice(0, 4),
    record_note: recordNote,
    search_sources: [
      "ESPEN Guidelines on Clinical Nutrition in the Intensive Care Unit (2023)",
      "ASPEN Guidelines for Nutrition Support Therapy in Critically Ill Patients",
      "ESPEN Guideline on Clinical Nutrition in Hospitalized Patients",
    ],
  };
}

function normalizeLabsOutput(parsed) {
  let list = [];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (Array.isArray(parsed?.labs)) {
    list = parsed.labs;
  } else if (Array.isArray(parsed?.tests)) {
    list = parsed.tests;
  } else if (Array.isArray(parsed?.results)) {
    list = parsed.results;
  } else if (Array.isArray(parsed?.data)) {
    list = parsed.data;
  } else if (typeof parsed === "object" && parsed !== null) {
    // If returned an object of key: value pairs
    for (const [key, val] of Object.entries(parsed)) {
      if (typeof val === "object" && val !== null && (val.value || val.val)) {
        list.push({ name: key, ...val });
      } else if (typeof val === "string" || typeof val === "number") {
        list.push({ name: key, value: String(val) });
      }
    }
  }

  const cleaned = list
    .map((lab) => {
      const name = String(lab.name || lab.test || lab.test_name || lab.title || "").trim();
      const value = String(lab.value || lab.result || lab.val || "").trim();
      const unit = String(lab.unit || lab.units || "").trim();
      const reference = String(lab.reference || lab.ref || lab.ref_range || lab.normal_range || "").trim();
      const abnormal =
        lab.abnormal === true ||
        /high|low|abnormal|بالا|پایین|H|L|\*/i.test(String(lab.flag || lab.status || ""));

      return {
        name: name.slice(0, 100),
        value: value.slice(0, 80),
        unit: unit.slice(0, 40),
        reference: reference.slice(0, 100),
        abnormal,
      };
    })
    .filter((lab) => lab.name && lab.value);

  return cleaned;
}

async function readBoundedJson(request, maxBytes) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) return { error: "حجم درخواست بیش از حد مجاز است.", status: 413 };
  const reader = request.body?.getReader();
  if (!reader) return { error: "بدنهٔ درخواست خالی است.", status: 400 };
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return { error: "حجم درخواست بیش از حد مجاز است.", status: 413 };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { error: "قالب JSON درخواست معتبر نیست.", status: 400 };
  }
}

export async function handleAiRequest(request, action) {
  if (request.method !== "POST") return jsonResponse({ error: "روش درخواست پشتیبانی نمی‌شود." }, 405);
  const parsed = await readBoundedJson(request, 15 * 1024 * 1024);
  if (parsed.error) return jsonResponse({ error: parsed.error }, parsed.status);
  const body = parsed.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) return jsonResponse({ error: "دادهٔ ورودی معتبر نیست." }, 400);

  if (action === "plan") {
    if ("image" in body || "mimeType" in body) return jsonResponse({ error: "درخواست طرح تغذیه نباید تصویر داشته باشد." }, 400);
    const safeInput = JSON.stringify(body);
    if (safeInput.length > 100_000) return jsonResponse({ error: "اطلاعات طرح تغذیه بیش از حد مجاز است." }, 413);

    const systemInstruction = `تو متخصص ارشد تغذیه بالینی (Clinical Dietitian Specialist) هستی.
وظیفه داری با استفاده از داده‌های بیمار، محاسبات بالینی، منابع کتابخانه تخصصی بیمارستان و جست‌وجوی زنده در آخرین گایدلاین‌های جهانی تغذیه بالینی (ESPEN، ASPEN، KDOQI، UpToDate) یک طرح مراقبت تغذیه‌ای مستند، دقیق و کاربردی ارائه دهی.
خروجی باید حتماً و فقط یک شیء JSON معتبر با کلیدهای زیر باشد:
{
  "required_labs": ["آزمایش ۱ با علت", "آزمایش ۲", ...],
  "supplement": "توصیه مکمل و ریزمغذی‌ها بر اساس ESPEN / ASPEN با دوز و منطق بالینی",
  "drug_interactions": ["تداخل غذا-دارو با داروهای بیمار و فاصله زمانی لازم", ...],
  "diet_principles": ["اصل ۱: اهداف و روش دریافت", "اصل ۲: کنترل ریفیدینگ یا حجم", ...],
  "record_note": "متن رسمی و ساختاریافته مشاوره تغذیه جهت درج در پرونده پزشکی بیمار",
  "search_sources": ["عنوان گایدلاین یا منبع علمی معتبر استنادشده", ...]
}`;

    const contents = [
      {
        role: "user",
        parts: [
          {
            text: `لطفاً بر اساس مشخصات بالینی بیمار، پروتکل منتخب، منابع کتابخانه و جست‌وجوی آخرین گایدلاین‌های تغذیه‌ای ESPEN/ASPEN، ارزیابی کامل را به صورت JSON ارائه بده:\n${safeInput}`,
          },
        ],
      },
    ];

    const result = await callGemini({
      contents,
      systemInstruction,
      enableSearch: true,
      maxOutputTokens: 3000,
    });

    if (result.text) {
      try {
        const parsedPlan = parseModelJson(result.text);
        return jsonResponse(planSchema(parsedPlan, result.searchSources));
      } catch (e) {
        console.warn("Failed to parse plan JSON:", e);
      }
    }

    return jsonResponse(generateClinicalPlanFallback(body));
  } else if (action === "labs") {
    const imageRaw = body.image;
    const mimeType = body.mimeType || "image/jpeg";
    if (typeof imageRaw !== "string" || imageRaw.length < 50) {
      return jsonResponse({ error: "تصویر برگه آزمایش ارسال نشده است." }, 400);
    }
    const cleanImage = imageRaw.replace(/\s+/g, "");
    if (cleanImage.length > 14_000_000) {
      return jsonResponse({ error: "حجم تصویر بسیار بالا است؛ لطفاً تصویر کوچک‌تری انتخاب کنید." }, 413);
    }

    const systemInstruction = `تو یک هوش مصنوعی بسیار پیشرفته در بینایی ماشین و بازخوانی اسناد آزمایشگاهی پزشکی و پاتولوژی (Medical Laboratory OCR Expert) هستی.
تصویر ارسالی یک برگه آزمایش پزشکی، خون‌شناسی، بیوشیمی، ادرار، هورمون یا پاتولوژی است.
وظیفه داری با دقت کلمه به کلمه و عدد به عدد تمام تست‌های موجود در جدول آزمایش را بخوانی. این آزمایش‌ها ممکن است نام انگلیسی (مانند WBC, RBC, HGB, PLT, FBS, BUN, Cr, Na, K, Albumin, AST, ALT, Bilirubin, PT, INR, CRP, ESR) یا فارسی (مانند هموگلوبین، قند، اوره، کراتینین، سدیم، پتاسیم و ...) داشته باشند.

برای هر تست:
- name: نام دقیق آزمایش
- value: مقدار گزارش‌شده (عدد یا متن)
- unit: واحد اندازه‌گیری (مانند mg/dL, g/dL, mmol/L, % و ...)
- reference: بازه مرجع نرمال نوشته‌شده در برگه (مانند 4.0 - 10.0)
- abnormal: اگر تست دارای علامت ستاره (*)، کلمه High یا Low یا خارج از بازه مرجع است، مقدار true قرار بده، در غیر این صورت false.

خروجی باید حتماً و فقط یک شیء JSON معتبر با ساختار زیر باشد:
{
  "labs": [
    {
      "name": "WBC",
      "value": "11.2",
      "unit": "10^3/uL",
      "reference": "4.0 - 10.0",
      "abnormal": true
    }
  ],
  "summary": "خلاصه کوتاه فارسی از مهم‌ترین موارد غیرطبیعی آزمایش در ۱ یا ۲ سطر"
}

اگر تصویر تار است یا تستی پیدا نشد، شیء با {"labs": [], "summary": "متنی یافت نشد"} برگردان. هیچ عبارت دیگری خارج از JSON برنگردان.`;

    const contents = [
      {
        role: "user",
        parts: [
          { text: "برگه آزمایش را با دقت بخوان و تمامی ردیف‌های جدول آزمایش، مقادیر، واحدها، بازه‌های مرجع و موارد غیرطبیعی را به صورت JSON استخراج کن." },
          { inlineData: { mimeType, data: cleanImage } },
        ],
      },
    ];

    const result = await callGemini({
      contents,
      systemInstruction,
      enableSearch: false,
      maxOutputTokens: 3000,
    });

    if (result.error) {
      return jsonResponse({ error: result.error }, result.status || 502);
    }

    try {
      const parsedJson = parseModelJson(result.text);
      const normalizedLabs = normalizeLabsOutput(parsedJson);
      const summary = typeof parsedJson?.summary === "string" ? parsedJson.summary : "";

      return jsonResponse({
        labs: normalizedLabs,
        summary,
        modelUsed: result.modelUsed,
      });
    } catch (parseErr) {
      console.warn("Lab JSON parse error:", parseErr, "raw:", result.text?.slice(0, 200));
      return jsonResponse({
        labs: [],
        summary: result.text || "",
        error: "استخراج جدول انجام نشد؛ لطفاً متن آزمایش را دستی وارد کنید.",
      });
    }
  } else {
    return jsonResponse({ error: "عملیات شناخته نشد." }, 404);
  }
}
