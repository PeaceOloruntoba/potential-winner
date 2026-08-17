import { FormEvent, useEffect, useState } from "react";
import { School, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import type { Classroom } from "../../types";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [subjectModalClassroom, setSubjectModalClassroom] = useState<Classroom | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/classrooms");
      setClassrooms(data.classrooms);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load classrooms."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell navItems={adminNavItems} pageTitle="Classrooms">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900 md:hidden">Classrooms</h1>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add classroom
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !classrooms || classrooms.length === 0 ? (
        <EmptyState
          icon={School}
          title="No classrooms yet"
          description="Classrooms are the dropdown source used everywhere — admissions, teacher assignments, and score entry."
          actionLabel="Add classroom"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-display font-semibold text-ink-900">{c.name}</p>
                  <button
                    onClick={() => setSubjectModalClassroom(c)}
                    className="text-xs font-medium text-action-600 hover:underline"
                  >
                    + Subject
                  </button>
                </div>
                {c.subjects && c.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {c.subjects.map((s) => (
                      <Badge key={s.id} tone="neutral">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink-400">No subjects yet</p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {modalOpen && <AddClassroomModal onClose={() => setModalOpen(false)} onCreated={load} />}
      {subjectModalClassroom && (
        <AddSubjectModal classroom={subjectModalClassroom} onClose={() => setSubjectModalClassroom(null)} onAdded={load} />
      )}
    </AppShell>
  );
}

function AddClassroomModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/admin/classrooms", { name });
      toast.success("Classroom added.");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't add classroom."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Add classroom">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Classroom name"
          required
          placeholder="e.g. JSS 1A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Add classroom
        </Button>
      </form>
    </Modal>
  );
}

function AddSubjectModal({
  classroom,
  onClose,
  onAdded,
}: {
  classroom: Classroom;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/admin/classrooms/${classroom.id}/subjects`, { name });
      toast.success("Subject added.");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't add subject."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Add subject to ${classroom.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject name"
          required
          placeholder="e.g. Mathematics"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Add subject
        </Button>
      </form>
    </Modal>
  );
}
