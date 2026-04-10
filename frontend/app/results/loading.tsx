import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-[min(42rem,100%)]" />
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full" />
        ))}
        <Skeleton className="ml-auto h-7 w-56 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-card">
        <div className="border-b border-border bg-surface-muted/60 px-4 py-3">
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

