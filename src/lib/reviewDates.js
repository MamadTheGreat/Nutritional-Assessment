import { WARD_OPTIONS } from "@/lib/clinicalDefaults";

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysISO(days, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function reviewDaysFor(wardType) {
  return (WARD_OPTIONS.find((w) => w.value === wardType) || WARD_OPTIONS[1]).reviewDays;
}

// فاصله تا موعد پایش (روز) — منفی یعنی سررسید گذشته
export function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = new Date(`${isoDate}T00:00:00`);
  const start = new Date(`${todayISO()}T00:00:00`);
  return Math.round((target - start) / 86400000);
}

export function reviewLabel(isoDate) {
  const days = daysUntil(isoDate);
  if (days == null) return "بدون موعد";
  if (days < 0) return `${Math.abs(days)} روز تأخیر`;
  if (days === 0) return "امروز";
  return `${days} روز دیگر`;
}
