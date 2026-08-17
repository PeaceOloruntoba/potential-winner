import clsx from "clsx";

type Tone = "success" | "warning" | "danger" | "neutral" | "action";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  neutral: "bg-surface-muted text-ink-500",
  action: "bg-action-50 text-action-700",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

/**
 * The recurring "money owed" signature motif — used on child-switcher
 * cards, invoice details, and the admin billing log, so a balance always
 * looks the same way everywhere in the product.
 */
export function BalancePill({ amount }: { amount: number }) {
  if (amount <= 0) {
    return <Badge tone="success">Fully paid</Badge>;
  }
  return (
    <span className="inline-flex items-center rounded-full bg-danger-50 px-2.5 py-1 text-xs font-semibold text-danger-600">
      ₦{amount.toLocaleString()} owed
    </span>
  );
}
