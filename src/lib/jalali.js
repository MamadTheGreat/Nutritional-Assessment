const persianPartsFormatter = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});
const persianDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  month: "long",
  timeZone: "UTC",
});
const persianNumberFormatter = new Intl.NumberFormat("fa-IR");

function partsFor(date) {
  const parts = Object.fromEntries(persianPartsFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

function dateFromIso(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function toJalaliIsoDate(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12)).toISOString().slice(0, 10);
}

export function getLocalToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

export function formatJalaliDate(value) {
  const date = dateFromIso(value);
  return date ? persianDateFormatter.format(date) : "";
}

export function getJalaliParts(date) {
  return partsFor(date);
}

export function getJalaliMonthLabel(date) {
  const { year } = partsFor(date);
  return `${persianMonthFormatter.format(date)} ${persianNumberFormatter.format(year)}`;
}

export function getJalaliDay(date) {
  return persianNumberFormatter.format(partsFor(date).day);
}

export function getJalaliMonthStart(date) {
  const target = partsFor(date);
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12));
  for (let offset = 0; offset < 32; offset += 1) {
    const previous = new Date(start);
    previous.setUTCDate(previous.getUTCDate() - 1);
    const parts = partsFor(previous);
    if (parts.year !== target.year || parts.month !== target.month) break;
    start.setTime(previous.getTime());
  }
  return start;
}

export function moveJalaliMonth(date, amount) {
  const start = getJalaliMonthStart(date);
  const moved = new Date(start);
  moved.setUTCDate(moved.getUTCDate() + amount * 32);
  return getJalaliMonthStart(moved);
}

export function jalaliDateFromIso(value) {
  return dateFromIso(value);
}

export function formatJalaliNumber(value) {
  return persianNumberFormatter.format(value);
}

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export function jalaliToGregorian(jy, jm, jd) {
  let gy = jy > 979 ? 1600 : 621;
  const normalizedJy = jy > 979 ? jy - 979 : jy;
  const days =
    365 * normalizedJy +
    Math.floor(normalizedJy / 33) * 8 +
    Math.floor(((normalizedJy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  let day = days % 146097;
  if (day >= 36525) {
    day -= 1;
    gy += 100 * Math.floor(day / 36524);
    day = day % 36524;
    if (day >= 365) day += 1;
  }
  gy += 4 * Math.floor(day / 1461);
  day = day % 1461;
  if (day >= 366) {
    day -= 1;
    gy += Math.floor(day / 365);
    day = day % 365;
  }
  const salA = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && day >= salA[gm]) {
    day -= salA[gm];
    gm += 1;
  }
  const gd = day + 1;
  return { gy, gm, gd };
}

export function dateFromJalali(jy, jm, jd = 1) {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
  return new Date(Date.UTC(gy, gm - 1, gd, 12));
}

export function parseJalaliInput(input) {
  if (!input || typeof input !== "string") return null;
  const latin = input
    .replace(/[۰-۹]/g, (d) => "0123456789"["۰۱۲۳۴۵۶۷۸۹".indexOf(d)])
    .trim();
  const match = latin.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) return null;
  const jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);
  if (jy < 1200 || jy > 1500) return null;
  if (jm < 1 || jm > 12) return null;
  if (jd < 1 || jd > 31) return null;
  if (jm > 6 && jd > 30) return null;
  const date = dateFromJalali(jy, jm, jd);
  return toJalaliIsoDate(date);
}
