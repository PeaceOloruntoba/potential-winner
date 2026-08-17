import { useEffect, useState } from "react";
import { UserCheck, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export function ApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load() {
    try {
      const { data } = await api.get("/admin/users/pending");
      setUsers(data.users);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load pending approvals."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(userId: string, decision: "APPROVE" | "REJECT") {
    setProcessingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/approve`, { decision });
      setUsers((prev) => prev?.filter((u) => u.id !== userId) ?? null);
      toast.success(decision === "APPROVE" ? "Parent account approved." : "Parent account rejected.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't process that decision."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="Parent approvals">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">Parent approvals</h1>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !users || users.length === 0 ? (
        <EmptyState icon={UserCheck} title="No pending approvals" description="New parent sign-ups will show up here for review." />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium text-ink-900">{u.full_name}</p>
                <p className="text-sm text-ink-500">{u.email}</p>
                <p className="text-xs text-ink-400">{u.phone}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={processingId === u.id}
                  onClick={() => handleDecision(u.id, "REJECT")}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button size="sm" isLoading={processingId === u.id} onClick={() => handleDecision(u.id, "APPROVE")}>
                  <Check className="h-4 w-4" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
