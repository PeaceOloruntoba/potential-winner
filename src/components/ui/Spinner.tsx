import { Loader2 } from "lucide-react";
import clsx from "clsx";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-ink-400">
      <Loader2 className={clsx("h-6 w-6 animate-spin text-action-500", className)} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft">
      <Spinner label="Loading…" />
    </div>
  );
}
