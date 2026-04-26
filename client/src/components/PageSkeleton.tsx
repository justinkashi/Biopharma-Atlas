function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ background: "hsl(var(--muted))" }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-5">
      <SkeletonBlock className="h-5 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <SkeletonBlock className="h-56 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonBlock className="h-80 rounded-xl" />
        <SkeletonBlock className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export function ChartPageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <SkeletonBlock className="h-5 w-56" />
      <SkeletonBlock className="h-12 rounded-xl" />
      <SkeletonBlock className="h-96 rounded-xl" />
      <SkeletonBlock className="h-40 rounded-xl" />
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <SkeletonBlock className="h-5 w-40" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-8 w-20 rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TablePageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <SkeletonBlock className="h-5 w-52" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
