import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

/**
 * Paystack redirects here after checkout. The webhook (not this page) is
 * the source of truth for whether the payment actually succeeded — this
 * page just gives the parent a clear "you're done, go check" moment rather
 * than silently dumping them back on the dashboard.
 */
export function PaymentCallbackPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="h-7 w-7 text-success-500" />
        </div>
        <h1 className="font-display text-lg font-bold text-ink-900">Payment submitted</h1>
        <p className="mt-2 text-sm text-ink-500">
          It may take a moment to reflect on your balance. Check your child's page for the latest status.
        </p>
        <Button fullWidth className="mt-6" onClick={() => navigate("/parent")}>
          Back to dashboard
        </Button>
      </Card>
    </div>
  );
}
