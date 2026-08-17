import clsx from "clsx";

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-lg bg-navy-100/70", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl2 border border-navy-100/60 bg-white p-5 shadow-card">
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="mb-2 h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
