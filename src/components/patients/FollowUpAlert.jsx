import { Link } from "@tanstack/react-router";
import { BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { reviewLabel } from "@/lib/reviewDates";

// پنجره یادآوری موعد پایش — یک بار در هر روز کاری پس از ورود نمایش داده می‌شود
export default function FollowUpAlert({ patients = [] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!patients.length) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `followup-alert-${today}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setOpen(true);
  }, [patients.length]);

  if (!patients.length) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <BellRing className="h-4 w-4 text-amber-600" />
            {patients.length} بیمار در موعد پایش
          </DialogTitle>
        </DialogHeader>

        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {patients.slice(0, 6).map((p) => (
            <li key={p.id}>
              <Link
                to="/patients/$patientId"
                params={{ patientId: p.id }}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 px-3 py-2.5 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold">{p.full_name}</p>
                  <p className="num text-[10.5px] text-muted-foreground">
                    {p.ward_type === "icu" ? "بخش ویژه · هر ۳ روز" : "بخش عادی · هفتگی"}
                    {p.file_number ? ` · پرونده ${p.file_number}` : ""}
                  </p>
                </div>
                <span className="num shrink-0 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                  {reviewLabel(p.next_review_date)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2">
          <Link
            to="/patients"
            onClick={() => setOpen(false)}
            className="text-[11.5px] font-semibold text-primary"
          >
            همه پرونده‌های سررسید‌شده
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            بستن
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
