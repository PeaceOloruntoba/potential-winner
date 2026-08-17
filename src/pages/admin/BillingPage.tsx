import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";

interface BillingEntry {
  id: string;
  session: string;
  term: number;
  active_student_count: number;
  rate_per_student: string;
  amount_due: string;
  status: "PENDING" | "INVOICED" | "PAID";
}

const STATUS_TONE = { PENDING: "warning", INVOICED: "action", PAID: "success" } as const;

export function BillingPage() {
  const [entries, setEntries] = useState<BillingEntry[] | null>(null);
  const [activeCount, setActiveCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const [logRes, countRes] = await Promise.all([
        api.get("/admin/billing/log"),
        api.get("/admin/billing/active-student-count"),
      ]);
      setEntries(logRes.data.billingLog);
      setActiveCount(countRes.data.activeStudentCount);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load billing data."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markStatus(logId: string, status: "INVOICED" | "PAID") {
    setProcessingId(logId);
    try {
      await api.patch(`/admin/billing/log/${logId}`, { status });
      toast.success(`Marked as ${status.toLowerCase()}.`);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't update billing status."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="Retainer billing">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">Retainer billing</h1>
      </div>

      <Card className="mb-5">
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm text-ink-500">Active students right now</p>
            {activeCount === null ? (
              <Skeleton className="mt-1 h-7 w-12" />
            ) : (
              <p className="font-display text-2xl font-bold text-ink-900">{activeCount}</p>
            )}
          </div>
          <p className="max-w-[55%] text-right text-xs text-ink-400">
            A snapshot is only recorded when you advance a term — this number updates live.
          </p>
        </CardBody>
      </Card>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No billing history yet"
          description="A row is logged automatically each time you advance the school to a new term."
        />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium text-ink-900">
                  {e.session} · Term {e.term}
                </p>
                <p className="text-sm text-ink-500">
                  {e.active_student_count} students × ₦{Number(e.rate_per_student).toLocaleString()} = ₦
                  {Number(e.amount_due).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge>
                {e.status === "PENDING" && (
                  <Button size="sm" variant="outline" isLoading={processingId === e.id} onClick={() => markStatus(e.id, "INVOICED")}>
                    Mark invoiced
                  </Button>
                )}
                {e.status === "INVOICED" && (
                  <Button size="sm" isLoading={processingId === e.id} onClick={() => markStatus(e.id, "PAID")}>
                    Mark paid
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
