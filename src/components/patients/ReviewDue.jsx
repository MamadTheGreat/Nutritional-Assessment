import { Link } from "@tanstack/react-router";
import { BellRing, ChevronLeft } from "lucide-react";
import { reviewLabel } from "@/lib/reviewDates";
import { cn } from "@/lib/utils";

// یادآوری داخل اپ برای بیمارانی که موعد پایش آن‌ها رسیده است
export default function ReviewDue({ patients = [] }) {
  if (!patients.length) return null;

  return (
    <section className="mb-3 overflow-hidden rounded-xl border border-amber-200 bg-amber-50">
      <div className="flex items-center gap-1.5 border-b border-amber-200 px-3.5 py-2 text-[11px] font-semibold text-amber-900">
        <BellRing className="h-3.5 w-3.5" />
        پایش سررسید‌شده — {patients.length} بیمار
      </div>
      <ul className="divide-y divide-amber-200/70">
        {patients.map((p) => (
          <li key={p.id}>
            <Link
              to="/patients/$patientId"
              params={{ patientId: p.id }}
              className="flex items-center justify-between gap-2 px-3.5 py-2 transition-colors hover:bg-amber-100/60"
            >
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-amber-950">{p.full_name}</p>
                <p className="num text-[10px] text-amber-800">
                  {p.ward_type === "icu" ? "بخش ویژه · هر ۳ روز" : "بخش عادی · هفتگی"}
                  {p.file_number ? ` · پرونده ${p.file_number}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "num shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
                  "border-amber-300 bg-amber-100 text-amber-900",
                )}
              >
                {reviewLabel(p.next_review_date)}
              </span>
              <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-amber-700" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
