import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import DictateButton from "@/components/assessment/DictateButton";
import ReviewDue from "@/components/patients/ReviewDue";
import { PageHead } from "@/components/assessment/ui-bits";
import { reviewLabel } from "@/lib/reviewDates";
import { dueReviews, listPatients } from "@/lib/server-fns";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/patients")({
  head: () => ({ meta: [{ title: "بیماران | دستیار بالین" }] }),
  validateSearch: (search) => (search.q ? { q: String(search.q) } : {}),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    const [patients, due] = await Promise.all([listPatients({ data: { search: deps.q } }), dueReviews()]);
    return { patients, due };
  },
  component: PatientsPage,
});

function PatientsPage() {
  const { patients, due } = Route.useLoaderData();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [text, setText] = useState(q || "");

  const dictate = (spoken) => {
    if (spoken === "__unsupported__") return toast.error("دیکته گفتاری در این مرورگر پشتیبانی نمی‌شود");
    setText((prev) => [prev, spoken].filter(Boolean).join(" "));
  };

  return (
    <div>
      <PageHead
        title="بیماران"
        subtitle={`${patients.length} پرونده${due.length ? ` · ${due.length} در موعد پایش` : ""} — مرتب‌شده بر اساس موعد پیگیری`}
        right={
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
          >
            <UserPlus className="h-3.5 w-3.5" />
            ارزیابی جدید
          </Link>
        }
      />

      <ReviewDue patients={due} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/patients", search: text ? { q: text } : {} });
        }}
        className="relative mb-3"
      >
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="جست‌وجوی نام یا شماره پرونده"
          className="h-10 bg-card pl-9 pr-9 text-[13px]"
        />
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
          <DictateButton onText={dictate} compact />
        </div>
      </form>

      {patients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="text-[13px] text-muted-foreground">پرونده‌ای یافت نشد</p>
          <Link to="/" className="mt-2 inline-block text-[12px] font-semibold text-primary">
            ثبت اولین ارزیابی
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {patients.map((p) => (
            <li key={p.id}>
              <Link
                to="/patients/$patientId"
                params={{ patientId: p.id }}
                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{p.full_name}</p>
                  <p className="num mt-0.5 text-[10.5px] text-muted-foreground">
                    {[p.file_number && `پرونده ${p.file_number}`, p.age && `${p.age} سال`, p.sex === "female" ? "زن" : p.sex === "male" ? "مرد" : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <span
                  className={cn(
                    "num shrink-0 rounded-md border px-1.5 py-0.5 text-[10px]",
                    p.next_review_date ? "border-border text-muted-foreground" : "border-dashed border-border text-muted-foreground/70",
                  )}
                >
                  {p.ward_type === "icu" ? "ویژه" : "عادی"} · {reviewLabel(p.next_review_date)}
                </span>
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
