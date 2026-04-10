import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-[min(42rem,100%)]" />
      </div>
      <div className="max-w-2xl rounded-xl border border-border bg-surface-elevated shadow-card">
        <div className="border-b border-border/80 p-5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-2 h-4 w-[min(28rem,100%)]" />
        </div>
        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

