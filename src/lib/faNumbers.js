// تبدیل گفتار فارسی به عدد — برای فیلدهای عددی که با دیکته پر می‌شوند.
const DIGITS = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9", "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9" };

const ONES = {
  صفر: 0, یک: 1, دو: 2, سه: 3, چهار: 4, پنج: 5, شش: 6, شیش: 6, هفت: 7, هشت: 8, نه: 9,
  ده: 10, یازده: 11, دوازده: 12, سیزده: 13, چهارده: 14, پانزده: 15, پونزده: 15,
  شانزده: 16, شونزده: 16, هفده: 17, هیفده: 17, هجده: 18, هیجده: 18, نوزده: 19,
  بیست: 20, سی: 30, چهل: 40, پنجاه: 50, شصت: 60, هفتاد: 70, هشتاد: 80, نود: 90,
};

const SCALES = { صد: 100, دویست: 200, سیصد: 300, چهارصد: 400, پانصد: 500, ششصد: 600, هفتصد: 700, هشتصد: 800, نهصد: 900, هزار: 1000 };

export function faDigits(text = "") {
  return String(text).replace(/[۰-۹٠-٩]/g, (d) => DIGITS[d] || d);
}

// "هفتاد و پنج" → 75 ، "یک و نیم" → 1.5 ، "۷۵" → 75
export function speechToNumber(text) {
  const raw = faDigits(text).replace(/[،,]/g, " ").trim();
  if (!raw) return null;
  const direct = Number(raw.replace(/[^\d.]/g, ""));
  if (Number.isFinite(direct) && /\d/.test(raw)) {
    const half = /نیم/.test(raw) && direct % 1 === 0 ? 0.5 : 0;
    return direct + half;
  }
  const words = raw.split(/\s+/).filter((w) => w !== "و");
  let total = 0;
  let current = 0;
  let matched = false;
  for (const word of words) {
    if (word === "نیم") { total += current + 0.5; current = 0; matched = true; continue; }
    if (word in ONES) { current += ONES[word]; matched = true; continue; }
    if (word in SCALES) {
      const value = SCALES[word];
      if (value === 1000) { total += (current || 1) * 1000; current = 0; }
      else current += value;
      matched = true;
    }
  }
  if (!matched) return null;
  const result = total + current;
  return Number.isFinite(result) && result > 0 ? result : null;
}
