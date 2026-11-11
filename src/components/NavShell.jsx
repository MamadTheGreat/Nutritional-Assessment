import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BookOpen, ClipboardPlus, HardDrive, Users } from "lucide-react";
import { BackupDialog } from "@/components/BackupDialog";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "ارزیابی جدید", icon: ClipboardPlus },
  { to: "/patients", label: "بیماران", icon: Users },
  { to: "/icu", label: "گاواژ ICU", icon: Activity },
  { to: "/library", label: "کتابخانه", icon: BookOpen },
];

function isActive(pathname, to) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function NavShell({ children, dueCount = 0 }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-60 flex-col border-l border-border bg-card md:flex">
        <div className="flex items-center gap-3 px-5 pb-5 pt-6">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
            تغ
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold">تغذیه بالینی</p>
            <p className="text-[11px] text-muted-foreground">دستیار بالین</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(pathname, to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                  active
                    ? "bg-secondary font-semibold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2.4 : 2} />
                {label}
                {to === "/patients" && dueCount > 0 ? (
                  <span className="num mr-auto grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9.5px] font-bold text-destructive-foreground">
                    {dueCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-3 space-y-2">
          <div className="px-2">
            <p className="text-[11px] font-medium text-foreground">ذخیره‌سازی روی این دستگاه</p>
            <p className="text-[10px] text-muted-foreground">بدون نیاز به اینترنت و ورود</p>
          </div>
          <BackupDialog>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-2.5 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <HardDrive className="h-3.5 w-3.5 text-primary" />
                <span>پشتیبان‌گیری / فایل</span>
              </span>
              <span className="text-[9.5px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">دائمی</span>
            </button>
          </BackupDialog>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-[12px] font-bold text-primary-foreground">
            تغ
          </div>
          <span className="text-[13px] font-semibold">تغذیه بالینی</span>
        </div>
        <BackupDialog>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-foreground hover:bg-muted"
          >
            <HardDrive className="h-3.5 w-3.5 text-primary" />
            <span>پشتیبان فایل</span>
          </button>
        </BackupDialog>
      </header>

      <main className="md:mr-60">
        <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 md:px-8 md:pb-14 md:pt-8">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card md:hidden">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(pathname, to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className="relative">
                <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.5 : 2} />
                {to === "/patients" && dueCount > 0 ? (
                  <span className="num absolute -left-2 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-destructive-foreground">
                    {dueCount}
                  </span>
                ) : null}
              </span>
              <span className={cn(active && "font-semibold")}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
