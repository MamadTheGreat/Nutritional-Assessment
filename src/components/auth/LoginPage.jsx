import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout
      icon={CheckCircle2}
      title="دستیار تغذیه بالینی"
      subtitle="برنامه در حالت محلی و بدون نیاز به ورود آمادهٔ استفاده است."
    >
      <Button
        type="button"
        className="h-11 w-full flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
        onClick={() => navigate({ to: "/", replace: true })}
      >
        <span>ورود به محیط ارزیابی و پرونده‌ها</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        تمامی پرونده‌ها و اطلاعات به‌صورت امن در حافظهٔ دستگاه شما نگهداری می‌شوند.
      </p>
    </AuthLayout>
  );
}
