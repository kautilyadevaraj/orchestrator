import { cn } from "@/lib/utils";

export function ConfidenceMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={cn("w-full", className)}>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-move"
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <p className="mt-1 text-xs tabular-nums text-ink-muted">{pct}%</p>
    </div>
  );
}
