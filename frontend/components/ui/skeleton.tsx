import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  shimmer = true,
}: {
  className?: string;
  shimmer?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-surface-muted/70",
        shimmer && "before:absolute before:inset-0 before:-translate-x-[60%] before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:animate-shimmer",
        className
      )}
      aria-hidden="true"
    />
  );
}

