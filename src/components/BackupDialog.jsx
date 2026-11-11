import { useState, useRef } from "react";
import { Download, Upload, HardDrive, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportDatabaseFile, importDatabaseFile } from "@/lib/driveStore";
import { toast } from "sonner";

export function BackupDialog({ children }) {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  async function handleExport() {
    try {
      await exportDatabaseFile();
      toast.success("فایل پشتیبان اطلاعات بیماران با موفقیت در دستگاه شما ذخیره شد.");
    } catch (err) {
      toast.error("خطا در ذخیره فایل: " + (err?.message || ""));
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") throw new Error("محتوای فایل خوانده نشد.");
        const res = await importDatabaseFile(text);
        toast.success(`اطلاعات ${res.patientCount} بیمار با موفقیت بازیابی شد.`);
        setOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } catch (err) {
        toast.error(err?.message || "خطا در بارگذاری فایل پشتیبان.");
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      toast.error("خطا در خواندن فایل.");
      setImporting(false);
    };
    reader.readAsText(file);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md text-right" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <HardDrive className="h-5 w-5 text-primary" />
            <span>مدیریت فایل و داده‌های دستگاه</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            داده‌های برنامه به‌صورت دائمی و خودکار در حافظهٔ همین دستگاه (تلفن همراه یا رایانه) ذخیره می‌شوند.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>ذخیره‌سازی محلی و امن فعال است</span>
            </div>
            <p className="leading-5">
              تمام پرونده‌های بیماران، ویزیت‌ها و کتابخانه در حافظهٔ محلی دستگاه شما نگهداری می‌شوند و برای دسترسی نیازی به ورود یا اینترنت نیست.
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-foreground">پشتیبان‌گیری و جابه‌جایی فایل:</p>

            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              className="w-full justify-start gap-2.5 h-11 text-xs font-medium"
            >
              <Download className="h-4 w-4 text-primary shrink-0" />
              <div className="text-right">
                <span className="font-semibold block">دانلود فایل پشتیبان (JSON)</span>
                <span className="text-[10px] text-muted-foreground block">ذخیره یک نسخه از پرونده‌ها در پوشه Downloads دستگاه</span>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full justify-start gap-2.5 h-11 text-xs font-medium"
            >
              <Upload className="h-4 w-4 text-primary shrink-0" />
              <div className="text-right">
                <span className="font-semibold block">{importing ? "در حال بازیابی…" : "بازیابی اطلاعات از فایل"}</span>
                <span className="text-[10px] text-muted-foreground block">انتخاب فایل پشتیبان قبلی و بازگردانی پرونده‌ها</span>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50/70 p-2.5 rounded-md border border-amber-200/50">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>پیشنهاد می‌شود قبل از تعویض گوشی یا مرورگر، یک نسخه پشتیبان دانلود فرمایید.</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
