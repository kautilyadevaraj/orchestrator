import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-[min(44rem,100%)]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-card">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-[min(28rem,100%)]" />
          <Skeleton className="mt-6 h-28 w-full rounded-xl" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-card">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-4 w-56" />
          <div className="mt-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

