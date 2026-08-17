import { useEffect, useState } from "react";
import { FileCheck2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  passport_url: string | null;
  classroom_name: string | null;
  parents: { parentId: string; parentName: string; parentEmail: string }[];
  created_at: string;
}

export function AdmissionsPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load() {
    try {
      const { data } = await api.get("/admissions/pending");
      setApplications(data.applications);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load pending applications."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(studentId: string) {
    setProcessingId(studentId);
    try {
      const { data } = await api.patch(`/admissions/${studentId}/approve`);
      setApplications((prev) => prev?.filter((a) => a.id !== studentId) ?? null);
      toast.success(`Approved — admission number ${data.student.admission_number}.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't approve this application."));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(studentId: string) {
    setProcessingId(studentId);
    try {
      await api.patch(`/admissions/${studentId}/reject`);
      setApplications((prev) => prev?.filter((a) => a.id !== studentId) ?? null);
      toast.success("Application rejected.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't reject this application."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="Admissions">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">Admissions</h1>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !applications || applications.length === 0 ? (
        <EmptyState icon={FileCheck2} title="No pending applications" description="New admission applications from parents will show up here." />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                {app.passport_url ? (
                  <img src={app.passport_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-surface-muted font-display text-sm font-bold text-ink-400">
                    {app.first_name[0]}
                    {app.last_name[0]}
                  </div>
                )}
                <div>
                  <p className="font-medium text-ink-900">
                    {app.first_name} {app.last_name}
                  </p>
                  <p className="text-sm text-ink-500">{app.classroom_name || "No classroom"}</p>
                  <p className="text-xs text-ink-400">
                    {app.parents.filter((p) => p.parentId).map((p) => p.parentName).join(", ") || "No linked parent"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={processingId === app.id}
                  onClick={() => handleReject(app.id)}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
                <Button size="sm" isLoading={processingId === app.id} onClick={() => handleApprove(app.id)}>
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
