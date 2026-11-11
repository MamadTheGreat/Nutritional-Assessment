import { ExternalLink } from "lucide-react";

export default function SourceFileLink({ url }) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-1 inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ExternalLink className="h-3 w-3" />
      مشاهدهٔ منبع
    </a>
  );
}
