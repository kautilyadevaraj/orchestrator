import { Mail } from "lucide-react";

export function CustomerMessage({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted/50 p-5 shadow-sm transition-[box-shadow,transform] duration-200 ease-enter">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
        <Mail className="h-3.5 w-3.5 text-accent" aria-hidden />
        Customer message
      </div>
      <p className="text-sm leading-relaxed text-ink">{text}</p>
    </div>
  );
}
