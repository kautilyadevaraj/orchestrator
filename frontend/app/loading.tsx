import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-[min(32rem,100%)]" />
        <Skeleton className="h-5 w-[min(40rem,100%)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface-elevated p-5 shadow-card"
          >
            <Skeleton className="mb-4 h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
            <Skeleton className="mt-6 h-9 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

