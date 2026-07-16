import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-muted/40", className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen relative z-10">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 glass border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-3.5" />
              <Skeleton className="w-20 h-2.5" />
            </div>
          </div>
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 space-y-3">
              <Skeleton className="w-24 h-3" />
              <div className="flex items-center justify-between">
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-12 h-12 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-4">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-48 h-3" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
          <div className="glass-card p-6 space-y-4 lg:col-span-2">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-52 h-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
              <Skeleton className="w-full h-12" />
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-40 h-5" />
                <Skeleton className="w-28 h-8" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="w-full h-10" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}