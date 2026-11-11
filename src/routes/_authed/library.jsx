import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import LibraryDialog from "@/components/library/LibraryDialog";
import SourceDialog from "@/components/library/SourceDialog";
import SourceFileLink from "@/components/library/SourceFileLink";
import { PageHead, Section } from "@/components/assessment/ui-bits";
import { SOURCE_KINDS } from "@/lib/clinicalDefaults";
import {
  createFormula,
  createProtocol,
  createSource,
  deleteSource,
  listFormulas,
  listProtocols,
  listSources,
} from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/library")({
  head: () => ({ meta: [{ title: "کتابخانه فرمولا، پروتکل و منابع | دستیار بالین" }] }),
  loader: async () => {
    const [protocols, formulas, sources] = await Promise.all([listProtocols(), listFormulas(), listSources()]);
    return { protocols, formulas, sources };
  },
  component: LibraryPage,
});

const addButton = (
  <button
    type="button"
    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
  >
    <Plus className="h-3 w-3" />
    افزودن
  </button>
);

const kindLabel = (kind) => (SOURCE_KINDS.find((k) => k.value === kind) || SOURCE_KINDS[0]).label;

function LibraryPage() {
  const { protocols, formulas, sources } = Route.useLoaderData();
  const router = useRouter();
  const addProtocol = createProtocol;
  const addFormula = createFormula;
  const addSource = createSource;
  const removeSource = deleteSource;

  async function dropSource(id) {
    await removeSource({ data: { id } });
    toast.success("منبع حذف شد");
    router.invalidate();
  }

  return (
    <div>
      <PageHead title="کتابخانه" subtitle="پروتکل بیماری‌ها، فرمولاهای گاواژ و منابع علمی" />

      <div className="space-y-3">
        <Section
          title="منابع علمی و درسی"
          right={<SourceDialog onSubmit={(payload) => addSource({ data: payload })} onDone={() => router.invalidate()} />}
        >
          {sources.length === 0 ? (
            <p className="text-[11.5px] leading-6 text-muted-foreground">
              گایدلاین، کتاب مرجع یا مقاله اضافه کنید؛ توصیه‌های ارزیابی بر پایه همین منابع تنظیم می‌شود.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {sources.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-2 py-2 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium leading-5">{s.title}</p>
                    <p className="num text-[10.5px] text-muted-foreground">
                      {[kindLabel(s.kind), s.authors, s.year, s.publisher, s.reviewed_on ? `بازبینی ${s.reviewed_on}` : null]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    {s.key_points ? (
                      <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-5 text-muted-foreground">{s.key_points}</p>
                    ) : null}
                    <SourceFileLink url={s.url} />
                  </div>
                  <button
                    type="button"
                    onClick={() => dropSource(s.id)}
                    aria-label="حذف منبع"
                    className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="پروتکل بیماری‌ها"
          right={
            <LibraryDialog
              trigger={addButton}
              title="پروتکل جدید"
              onDone={() => router.invalidate()}
              onSubmit={(payload) => addProtocol({ data: payload })}
              fields={[
                { key: "name", label: "نام پروتکل", type: "text", required: true },
                { key: "stress_factor", label: "ضریب kcal/kg", type: "number", required: true },
                { key: "protein_per_kg", label: "پروتئین g/kg", type: "number", required: true },
                { key: "fluid_per_kg", label: "مایع ml/kg", type: "number" },
                { key: "fluid_cap", label: "سقف مایع (ml)", type: "number" },
                { key: "notes", label: "نکته کلیدی", type: "text" },
                { key: "evidence", label: "مرجع علمی", type: "text" },
              ]}
            />
          }
        >
          <ul className="divide-y divide-border">
            {protocols.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium">{p.name}</p>
                  {p.notes ? <p className="text-[10.5px] leading-5 text-muted-foreground">{p.notes}</p> : null}
                  {p.evidence ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground/90">
                      {p.source_url ? (
                        <a href={p.source_url} target="_blank" rel="noreferrer" className="underline decoration-dotted">
                          {p.evidence}
                        </a>
                      ) : (
                        p.evidence
                      )}
                    </p>
                  ) : null}
                </div>
                <span className="num shrink-0 text-[10.5px] text-muted-foreground">
                  {p.stress_factor} kcal · {p.protein_per_kg} g/kg
                  {p.fluid_cap ? ` · ≤${p.fluid_cap}ml` : ""}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="فرمولاهای گاواژ"
          right={
            <LibraryDialog
              trigger={addButton}
              title="فرمولای جدید"
              onDone={() => router.invalidate()}
              onSubmit={(payload) => addFormula({ data: payload })}
              fields={[
                { key: "name", label: "نام فرمولا", type: "text", required: true },
                { key: "manufacturer", label: "برند / سازنده", type: "text" },
                { key: "kcal_per_ml", label: "kcal/ml", type: "number", required: true },
                { key: "protein_per_100ml", label: "پروتئین g/100ml", type: "number", required: true },
                { key: "category", label: "دسته", type: "text" },
                { key: "notes", label: "توضیح", type: "text" },
              ]}
            />
          }
        >
          <ul className="divide-y divide-border">
            {formulas.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium">{f.name}</p>
                  <p className="text-[10.5px] text-muted-foreground">
                    {[f.manufacturer, f.category, f.notes].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <span className="num shrink-0 text-[10.5px] text-muted-foreground">
                  {f.kcal_per_ml} kcal/ml · {f.protein_per_100ml} g/100ml
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
