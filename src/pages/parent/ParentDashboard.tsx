import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ChevronRight, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import type { Child } from "../../types";
import { AppShell } from "../../components/layout/AppShell";
import { parentNavItems } from "./parentNav";
import { Card } from "../../components/ui/Card";
import { Badge, BalancePill } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export function ParentDashboard() {
  const [children, setChildren] = useState<Child[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/parents/children");
        if (!cancelled) setChildren(data.children);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't load your children."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell navItems={parentNavItems} pageTitle="My children">
      <div className="mb-5 flex items-center justify-between md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">My children</h1>
      </div>

      <div className="mb-5 flex justify-end">
        <Button size="sm" onClick={() => navigate("/parent/apply")}>
          <UserPlus className="h-4 w-4" /> Apply for a child
        </Button>
      </div>

      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : !children || children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No children yet"
          description="Submit an admission application to get started — you can track its status right here."
          actionLabel="Apply for a child"
          onAction={() => navigate("/parent/apply")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} onOpen={() => navigate(`/parent/children/${child.id}`)} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ChildCard({ child, onOpen }: { child: Child; onOpen: () => void }) {
  const initials = `${child.firstName[0]}${child.lastName[0]}`.toUpperCase();

  return (
    <Card
      as="button"
      onClick={onOpen}
      className="w-full cursor-pointer p-5 text-left transition-shadow hover:shadow-raised"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-sm font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="font-display font-semibold text-ink-900">
              {child.firstName} {child.lastName}
            </p>
            <p className="text-sm text-ink-500">{child.classroomName || "Class not yet assigned"}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-400" />
      </div>

      <div className="mt-4">
        {child.admissionStatus === "PENDING_REVIEW" && (
          <Badge tone="warning">
            <Clock className="mr-1 inline h-3 w-3" /> Application pending
          </Badge>
        )}
        {child.admissionStatus === "REJECTED" && <Badge tone="danger">Application not approved</Badge>}
        {child.admissionStatus === "WITHDRAWN" && <Badge tone="neutral">Withdrawn</Badge>}
        {child.admissionStatus === "GRADUATED" && <Badge tone="action">Graduated</Badge>}
        {child.admissionStatus === "APPROVED" && child.balance != null && (
          <BalancePill amount={child.balance} />
        )}
      </div>
    </Card>
  );
}
