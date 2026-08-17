import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserCheck, FileCheck2, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card } from "../../components/ui/Card";
import { Skeleton } from "../../components/ui/Skeleton";

export function AdminDashboard() {
  const [stats, setStats] = useState<{ pendingParents: number; pendingAdmissions: number; activeStudents: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [parentsRes, admissionsRes, countRes] = await Promise.all([
          api.get("/admin/users/pending"),
          api.get("/admissions/pending"),
          api.get("/admin/billing/active-student-count"),
        ]);
        setStats({
          pendingParents: parentsRes.data.users.length,
          pendingAdmissions: admissionsRes.data.applications.length,
          activeStudents: countRes.data.activeStudentCount,
        });
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't load dashboard stats."));
      }
    })();
  }, []);

  const cards = [
    {
      label: "Pending parent approvals",
      value: stats?.pendingParents,
      icon: UserCheck,
      tone: "text-warning-600 bg-warning-50",
      onClick: () => navigate("/admin/approvals"),
    },
    {
      label: "Pending admissions",
      value: stats?.pendingAdmissions,
      icon: FileCheck2,
      tone: "text-action-600 bg-action-50",
      onClick: () => navigate("/admin/admissions"),
    },
    {
      label: "Active students",
      value: stats?.activeStudents,
      icon: Users,
      tone: "text-success-600 bg-success-50",
      onClick: () => navigate("/admin/students"),
    },
  ];

  return (
    <AppShell navItems={adminNavItems} pageTitle="Dashboard">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card
            key={c.label}
            as="button"
            onClick={c.onClick}
            className="w-full p-5 text-left transition-shadow hover:shadow-raised"
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </div>
            {stats === null ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="font-display text-2xl font-bold text-ink-900">{c.value}</p>
            )}
            <p className="mt-1 text-sm text-ink-500">{c.label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center gap-2 text-ink-500">
          <TrendingUp className="h-4 w-4" />
          <p className="text-sm">
            Use <span className="font-medium text-ink-700">Fees & Terms</span> to advance the school to a new
            term — it bulk-generates invoices and logs your retainer billing automatically.
          </p>
        </div>
      </Card>
    </AppShell>
  );
}
