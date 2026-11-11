import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DictateButton from "@/components/assessment/DictateButton";
import { Field } from "@/components/assessment/ui-bits";
import { SOURCE_KINDS } from "@/lib/clinicalDefaults";
import { speechToNumber } from "@/lib/faNumbers";

const EMPTY = { title: "", authors: "", year: "", kind: "guideline", publisher: "", url: "", key_points: "" };

// ثبت منبع درسی/آکادمیک برای استفاده در ارزیابی
export default function SourceDialog({ onSubmit, onDone }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));
  const dictate = (key) => (text) => {
    if (text === "__unsupported__") return toast.error("دیکته گفتاری در این مرورگر پشتیبانی نمی‌شود");
    set(key, [values[key], text].filter(Boolean).join("، "));
  };

  async function submit() {
    if (!values.title.trim()) return toast.error("عنوان منبع الزامی است");
    setBusy(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        authors: values.authors || undefined,
        year: values.year === "" ? undefined : speechToNumber(String(values.year)) || Number(values.year),
        kind: values.kind,
        publisher: values.publisher || undefined,
        url: values.url || undefined,
        key_points: values.key_points || undefined,
      });
      toast.success("منبع به کتابخانه اضافه شد");
      setValues(EMPTY);
      setOpen(false);
      onDone();
    } catch (error) {
      toast.error("افزودن منبع انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          افزودن
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px]">منبع علمی جدید</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="عنوان" className="col-span-2" action={<DictateButton onText={dictate("title")} />}>
            <Input value={values.title} onChange={(e) => set("title", e.target.value)} className="h-9 text-[13px]" />
          </Field>
          <Field label="نویسنده / سازمان" className="col-span-2" action={<DictateButton onText={dictate("authors")} />}>
            <Input value={values.authors} onChange={(e) => set("authors", e.target.value)} className="h-9 text-[13px]" />
          </Field>
          <Field label="سال">
            <Input
              type="number"
              inputMode="numeric"
              value={values.year}
              onChange={(e) => set("year", e.target.value)}
              className="h-9 num text-[13px]"
            />
          </Field>
          <Field label="نوع منبع">
            <Select value={values.kind} onValueChange={(v) => set("kind", v)}>
              <SelectTrigger className="h-9 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_KINDS.map((k) => (
                  <SelectItem key={k.value} value={k.value} className="text-[12px]">
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="ناشر / مجله" className="col-span-2" action={<DictateButton onText={dictate("publisher")} />}>
            <Input value={values.publisher} onChange={(e) => set("publisher", e.target.value)} className="h-9 text-[13px]" />
          </Field>
          <Field label="نشانی" className="col-span-2">
            <Input
              value={values.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="https://"
              className="h-9 text-[13px]"
              dir="ltr"
            />
          </Field>
          <Field label="نکات کلیدی قابل استناد" className="col-span-2" action={<DictateButton onText={dictate("key_points")} />}>
            <Textarea
              rows={3}
              value={values.key_points}
              onChange={(e) => set("key_points", e.target.value)}
              placeholder="مثلاً: انرژی ۲۵–۳۰ kcal/kg؛ پروتئین ۱.۲–۲ g/kg در سوختگی"
              className="resize-none text-[13px]"
            />
          </Field>
        </div>
        <Button onClick={submit} disabled={busy} className="mt-1 w-full py-2 text-[12.5px]">
          {busy ? "در حال ذخیره…" : "ذخیره"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
