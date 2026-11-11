import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/googleAuth";
import { safeReturnTo } from "@/lib/authReturnTo";

export function LoginPage() {
  const returnTo = safeReturnTo();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rememberAccount, setRememberAccount] = useState(false);

  useEffect(() => {
    try {
      setRememberAccount(window.localStorage.getItem("rememberGoogleAccount") === "true");
    } catch {
      setRememberAccount(false);
    }
  }, []);

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle({ rememberAccount });
      const destination = new URL(returnTo || "/", window.location.origin);
      await navigate({
        to: destination.pathname,
        search: Object.fromEntries(destination.searchParams.entries()),
        replace: true,
      });
    } catch (cause) {
      setError(cause?.message || "ورود با گوگل انجام نشد.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout icon={LogIn} title="ورود به دستیار تغذیه" subtitle="برای دسترسی به پرونده‌ها با حساب گوگل خود وارد شوید">
      <Button type="button" className="h-11 w-full flex items-center justify-center gap-2.5 text-sm font-medium shadow-sm" onClick={signIn} disabled={busy}>
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
        </svg>
        <span>{busy ? "در حال اتصال…" : "ورود با حساب گوگل"}</span>
      </Button>
      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={rememberAccount}
          onChange={(event) => {
            const checked = event.target.checked;
            setRememberAccount(checked);
            try {
              window.localStorage.setItem("rememberGoogleAccount", String(checked));
            } catch {
              setRememberAccount(false);
              setError("تنظیم یادآوری حساب در این مرورگر ذخیره نشد.");
            }
          }}
          className="h-4 w-4 accent-primary"
        />
        مرا به خاطر بسپار
      </label>
      {error ? (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <p className="mt-5 text-center text-xs leading-6 text-muted-foreground">
        این گزینه فقط انتخاب حساب گوگل را به خاطر می‌سپارد؛ توکن ورود در حافظه می‌ماند و در مرورگر ذخیره نمی‌شود.
      </p>
    </AuthLayout>
  );
}
