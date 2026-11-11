import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DictateButton from "@/components/assessment/DictateButton";
import { Field } from "@/components/assessment/ui-bits";
import { speechToNumber } from "@/lib/faNumbers";

// Generic two-column numeric form inside a dialog, used for both library types.
export default function LibraryDialog({ trigger, title, fields, onSubmit, onDone }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const dictate = (key, isNumber) => (text) => {
    if (text === "__unsupported__") return toast.error("دیکته گفتاری در این مرورگر پشتیبانی نمی‌شود");
    if (isNumber) {
      const parsed = speechToNumber(text);
      if (parsed == null) return toast.error("عدد از صدا تشخیص داده نشد");
      set(key, String(parsed));
      return;
    }
    set(key, [values[key], text].filter(Boolean).join("، "));
  };

  async function submit() {
    const payload = {};
    for (const f of fields) {
      const raw = values[f.key];
      if (f.type === "number") {
        if (raw === undefined || raw === "" || raw === null) {
          if (f.required) return toast.error(`${f.label} الزامی است`);
          continue;
        }
        payload[f.key] = Number(raw);
      } else {
        if (!raw && f.required) return toast.error(`${f.label} الزامی است`);
        if (raw) payload[f.key] = raw;
      }
    }
    setBusy(true);
    try {
      await onSubmit(payload);
      toast.success("به کتابخانه اضافه شد");
      setValues({});
      setOpen(false);
      onDone();
    } catch (error) {
      toast.error("افزودن انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px]">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <Field
              key={f.key}
              label={f.label}
              className={f.type === "text" || f.wide ? "col-span-2" : ""}
              action={<DictateButton onText={dictate(f.key, f.type === "number")} compact />}
            >
              {f.multiline ? (
                <Textarea
                  rows={2}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="resize-none text-[13px]"
                />
              ) : (
                <Input
                  type={f.type === "number" ? "number" : "text"}
                  step={f.type === "number" ? "0.1" : undefined}
                  value={values[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="h-9 num text-[13px]"
                />
              )}
            </Field>
          ))}
        </div>
        <Button onClick={submit} disabled={busy} className="mt-1 w-full py-2 text-[12.5px]">
          {busy ? "در حال ذخیره…" : "ذخیره"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
