import { CalendarDays, ChevronLeft, ChevronRight, CornerDownLeft, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field } from "@/components/assessment/ui-bits";
import {
  JALALI_MONTHS,
  dateFromJalali,
  formatJalaliDate,
  formatJalaliNumber,
  getJalaliDay,
  getJalaliMonthStart,
  getJalaliParts,
  getLocalToday,
  jalaliDateFromIso,
  moveJalaliMonth,
  parseJalaliInput,
  toJalaliIsoDate,
} from "@/lib/jalali";

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const WEEKDAYS_FULL = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
const DAY_MS = 24 * 60 * 60 * 1000;

// Build years from 1300 to 1415
const JALALI_YEARS = Array.from({ length: 1415 - 1300 + 1 }, (_, i) => 1415 - i);

function buildCalendarDays(viewDate) {
  const monthStart = getJalaliMonthStart(viewDate);
  const firstDayOffset = (monthStart.getUTCDay() + 1) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setUTCDate(gridStart.getUTCDate() - firstDayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getTime() + index * DAY_MS);
    const { year, month } = getJalaliParts(date);
    const currentMonth = getJalaliParts(monthStart);
    return {
      date,
      iso: toJalaliIsoDate(date),
      day: getJalaliDay(date),
      inMonth: year === currentMonth.year && month === currentMonth.month,
    };
  });
}

export default function PersianDatePicker({ label, value, onChange }) {
  const selectedDate = jalaliDateFromIso(value);
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate || getJalaliMonthStart(getLocalToday()));
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState("");

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const today = toJalaliIsoDate(getLocalToday());
  const currentParts = useMemo(() => getJalaliParts(viewDate), [viewDate]);

  function showCalendar(nextOpen) {
    if (nextOpen && selectedDate) {
      setViewDate(getJalaliMonthStart(selectedDate));
    }
    setManualInput("");
    setManualError("");
    setOpen(nextOpen);
  }

  function handleYearChange(event) {
    const nextYear = Number(event.target.value);
    const newDate = dateFromJalali(nextYear, currentParts.month, 1);
    setViewDate(getJalaliMonthStart(newDate));
  }

  function handleMonthChange(event) {
    const nextMonth = Number(event.target.value);
    const newDate = dateFromJalali(currentParts.year, nextMonth, 1);
    setViewDate(getJalaliMonthStart(newDate));
  }

  function jumpYears(yearsBack) {
    const todayParts = getJalaliParts(getLocalToday());
    const targetYear = todayParts.year - yearsBack;
    const newDate = dateFromJalali(targetYear, todayParts.month, todayParts.day);
    const iso = toJalaliIsoDate(newDate);
    setViewDate(getJalaliMonthStart(newDate));
    onChange(iso);
    setOpen(false);
  }

  function handleManualSubmit(e) {
    e?.preventDefault();
    const iso = parseJalaliInput(manualInput);
    if (!iso) {
      setManualError("قالب نامعتبر است (مثال: ۱۳۶۵/۰۴/۱۵)");
      return;
    }
    setManualError("");
    const parsedDate = jalaliDateFromIso(iso);
    if (parsedDate) setViewDate(getJalaliMonthStart(parsedDate));
    onChange(iso);
    setOpen(false);
  }

  return (
    <Field label={label}>
      <Popover open={open} onOpenChange={showCalendar}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label={`${label}، ${value ? formatJalaliDate(value) : "انتخاب تاریخ"}`}
            className="h-10 w-full justify-start gap-2 px-3 text-right text-[12px] font-normal"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className={value ? "font-medium" : "text-muted-foreground"}>
              {value ? formatJalaliDate(value) : "انتخاب تاریخ..."}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          dir="rtl"
          align="start"
          className="w-[min(22rem,calc(100vw-2rem))] p-3 text-foreground shadow-lg"
        >
          {/* Month & Year Direct Selectors Header */}
          <div className="mb-2.5 flex items-center justify-between gap-1.5 border-b border-border pb-2.5">
            <button
              type="button"
              onClick={() => setViewDate((date) => moveJalaliMonth(date, 1))}
              aria-label="ماه بعد"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex flex-1 items-center justify-center gap-1.5">
              {/* Month selector */}
              <select
                aria-label="انتخاب ماه"
                value={currentParts.month}
                onChange={handleMonthChange}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {JALALI_MONTHS.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year selector */}
              <select
                aria-label="انتخاب سال"
                value={currentParts.year}
                onChange={handleYearChange}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {JALALI_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {formatJalaliNumber(y)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setViewDate((date) => moveJalaliMonth(date, -1))}
              aria-label="ماه قبل"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Quick Shortcuts for Rapid Patient Navigation */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1 border-b border-border pb-2">
            <span className="text-[10px] font-medium text-muted-foreground">پرش سریع:</span>
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setViewDate(getJalaliMonthStart(getLocalToday()));
                setOpen(false);
              }}
              className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-primary hover:bg-muted/80"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => jumpYears(10)}
              className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-foreground hover:bg-muted/80"
            >
              ۱۰ سال قبل
            </button>
            <button
              type="button"
              onClick={() => jumpYears(30)}
              className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-foreground hover:bg-muted/80"
            >
              ۳۰ سال قبل
            </button>
            <button
              type="button"
              onClick={() => jumpYears(60)}
              className="rounded bg-muted px-1.5 py-0.5 text-[10.5px] font-medium text-foreground hover:bg-muted/80"
            >
              ۶۰ سال قبل
            </button>
          </div>

          {/* Direct Jalali Text Input */}
          <form onSubmit={handleManualSubmit} className="mb-2.5 flex items-center gap-1.5">
            <input
              type="text"
              dir="ltr"
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                setManualError("");
              }}
              placeholder="مثال: 1360/05/20"
              className="h-7 flex-1 rounded border border-input bg-background px-2 text-center text-xs tracking-wider placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="inline-flex h-7 items-center gap-1 rounded bg-secondary px-2 text-[11px] font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              <CornerDownLeft className="h-3 w-3" />
              ثبت
            </button>
          </form>
          {manualError ? (
            <p className="mb-2 text-[10px] text-destructive">{manualError}</p>
          ) : null}

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((day, i) => (
              <span
                key={day}
                aria-label={WEEKDAYS_FULL[i]}
                title={WEEKDAYS_FULL[i]}
                className="py-1 text-[11px] font-semibold text-muted-foreground"
              >
                {day}
              </span>
            ))}
            {days.map(({ iso, day, inMonth }) => (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  onChange(iso);
                  setOpen(false);
                }}
                aria-label={formatJalaliDate(iso)}
                aria-pressed={value === iso}
                className={[
                  "mx-auto grid h-8 w-8 place-items-center rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  value === iso
                    ? "bg-primary font-bold text-primary-foreground shadow-sm"
                    : "hover:bg-muted",
                  iso === today && value !== iso
                    ? "font-bold text-primary ring-1 ring-primary/40"
                    : "",
                  inMonth ? "text-foreground" : "text-muted-foreground/40",
                ].join(" ")}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Bottom actions: Reset & Clear */}
          <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={() => setViewDate(getJalaliMonthStart(getLocalToday()))}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              بازگشت به ماه جاری
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" />
                پاک‌کردن
              </button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
