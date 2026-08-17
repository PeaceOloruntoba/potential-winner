import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface Student {
  id: string;
  admission_number: string | null;
  first_name: string;
  last_name: string;
  classroom_name: string | null;
  admission_status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "GRADUATED";
}

const STATUS_TONE: Record<Student["admission_status"], "success" | "warning" | "danger" | "neutral" | "action"> = {
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  WITHDRAWN: "neutral",
  GRADUATED: "action",
};

const TRANSITIONS: Record<string, { label: string; next: "WITHDRAWN" | "GRADUATED" | "APPROVED" }[]> = {
  APPROVED: [
    { label: "Mark withdrawn", next: "WITHDRAWN" },
    { label: "Mark graduated", next: "GRADUATED" },
  ],
  WITHDRAWN: [{ label: "Reinstate", next: "APPROVED" }],
  GRADUATED: [{ label: "Reinstate", next: "APPROVED" }],
};

export function StudentsPage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function load(status?: string) {
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/students", { params: status ? { status } : {} });
      setStudents(data.students);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load students."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleTransition(studentId: string, status: string) {
    setProcessingId(studentId);
    try {
      await api.patch(`/admin/students/${studentId}/status`, { status });
      toast.success("Status updated.");
      load(statusFilter || undefined);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't update status."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="Students">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900 md:hidden">Students</h1>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            load(e.target.value || undefined);
          }}
          className="sm:w-56"
        >
          <option value="">All statuses</option>
          <option value="PENDING_REVIEW">Pending review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
          <option value="GRADUATED">Graduated</option>
        </Select>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !students || students.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="Try a different filter, or check back after admissions are approved." />
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <Card key={s.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="font-medium text-ink-900">
                  {s.first_name} {s.last_name}
                </p>
                <p className="text-sm text-ink-500">
                  {s.classroom_name || "No classroom"}
                  {s.admission_number ? ` · ${s.admission_number}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[s.admission_status]}>{s.admission_status.replace("_", " ")}</Badge>
                {(TRANSITIONS[s.admission_status] || []).map((t) => (
                  <button
                    key={t.next}
                    disabled={processingId === s.id}
                    onClick={() => handleTransition(s.id, t.next)}
                    className="text-xs font-medium text-action-600 hover:underline disabled:opacity-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
