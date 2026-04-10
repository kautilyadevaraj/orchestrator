import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Skeleton className="h-7 w-28" />

      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-[min(46rem,100%)]" />
      </div>

      <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-card">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="mb-3 h-4 w-full last:mb-0" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-card">
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
    </div>
  );
}

