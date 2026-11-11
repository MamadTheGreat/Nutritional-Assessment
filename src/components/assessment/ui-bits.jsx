import { cn } from "@/lib/utils";

export function Field({ label, children, className, action }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

export function PageHead({ title, subtitle, right }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-[19px] font-bold tracking-tight md:text-[22px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Section({ title, step, children, right, className }) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <h2 className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
          {step ? (
            <span className="num grid h-4 w-4 place-items-center rounded bg-secondary text-[9.5px] text-primary">
              {step}
            </span>
          ) : null}
          {title}
        </h2>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
