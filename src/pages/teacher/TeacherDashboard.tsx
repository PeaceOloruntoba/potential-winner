import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { teacherNavItems } from "./teacherNav";
import { Card } from "../../components/ui/Card";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface Assignment {
  classroom_id: string;
  classroom_name: string;
  subject_id: string;
  subject_name: string;
}

export function TeacherDashboard() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/teacher/my-assignments")
      .then(({ data }) => setAssignments(data.assignments))
      .catch((err) => toast.error(apiErrorMessage(err, "Couldn't load your classes.")))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell navItems={teacherNavItems} pageTitle="My classes">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">My classes</h1>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !assignments || assignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No classes assigned yet"
          description="Once the admin assigns you to a classroom and subject, it'll show up here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Card
              key={`${a.classroom_id}-${a.subject_id}`}
              as="button"
              onClick={() => navigate(`/teacher/scores/${a.classroom_id}/${a.subject_id}`)}
              className="flex w-full items-center justify-between p-4 text-left transition-shadow hover:shadow-raised"
            >
              <div>
                <p className="font-display font-semibold text-ink-900">{a.subject_name}</p>
                <p className="text-sm text-ink-500">{a.classroom_name}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-ink-400" />
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
