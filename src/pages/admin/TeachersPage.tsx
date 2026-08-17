import { FormEvent, useEffect, useState } from "react";
import { UserCog, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import type { Classroom } from "../../types";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Modal } from "../../components/ui/Modal";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  assignments: { classroomId: string; classroomName: string; subjectId: string; subjectName: string }[];
}

export function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalTeacher, setAssignModalTeacher] = useState<Teacher | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const [teachersRes, classroomsRes] = await Promise.all([
        api.get("/admin/teachers"),
        api.get("/admin/classrooms"),
      ]);
      setTeachers(teachersRes.data.teachers);
      setClassrooms(classroomsRes.data.classrooms);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load teachers."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell navItems={adminNavItems} pageTitle="Teachers">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink-900 md:hidden">Teachers</h1>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add teacher
          </Button>
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : !teachers || teachers.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No teachers yet"
          description="Add teacher accounts and assign them to classrooms and subjects."
          actionLabel="Add teacher"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {teachers.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="font-medium text-ink-900">{t.full_name}</p>
                  <p className="text-sm text-ink-500">{t.email}</p>
                </div>
                <button
                  onClick={() => setAssignModalTeacher(t)}
                  className="text-xs font-medium text-action-600 hover:underline"
                >
                  + Add assignment
                </button>
              </div>
              {t.assignments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.assignments.map((a) => (
                    <Badge key={a.subjectId} tone="action">
                      {a.classroomName} · {a.subjectName}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddTeacherModal classrooms={classrooms} onClose={() => setModalOpen(false)} onCreated={load} />
      )}
      {assignModalTeacher && (
        <AddAssignmentModal
          teacher={assignModalTeacher}
          classrooms={classrooms}
          onClose={() => setAssignModalTeacher(null)}
          onAdded={load}
        />
      )}
    </AppShell>
  );
}

function AddTeacherModal({
  classrooms,
  onClose,
  onCreated,
}: {
  classrooms: Classroom[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClassroom = classrooms.find((c) => c.id === classroomId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/admin/teachers", {
        fullName,
        email,
        phone,
        password,
        assignments: classroomId && subjectId ? [{ classroomId, subjectId }] : [],
      });
      toast.success("Teacher account created.");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't create the teacher account."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Add teacher">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isSubmitting} />
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
        <Input label="Phone" required value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
        <Input
          label="Temporary password"
          type="password"
          required
          hint="At least 8 characters. Share this with the teacher directly."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Classroom (optional)"
            placeholder="None"
            value={classroomId}
            onChange={(e) => {
              setClassroomId(e.target.value);
              setSubjectId("");
            }}
            disabled={isSubmitting}
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Subject"
            placeholder="Select subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            disabled={isSubmitting || !selectedClassroom}
          >
            {(selectedClassroom?.subjects || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create teacher account
        </Button>
      </form>
    </Modal>
  );
}

function AddAssignmentModal({
  teacher,
  classrooms,
  onClose,
  onAdded,
}: {
  teacher: Teacher;
  classrooms: Classroom[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedClassroom = classrooms.find((c) => c.id === classroomId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!classroomId || !subjectId) {
      toast.error("Select a classroom and subject.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/admin/teachers/${teacher.id}/assignments`, { classroomId, subjectId });
      toast.success("Assignment added.");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't add the assignment."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Assign ${teacher.full_name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Classroom"
          required
          placeholder="Select classroom"
          value={classroomId}
          onChange={(e) => {
            setClassroomId(e.target.value);
            setSubjectId("");
          }}
          disabled={isSubmitting}
        >
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Subject"
          required
          placeholder="Select subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          disabled={isSubmitting || !selectedClassroom}
        >
          {(selectedClassroom?.subjects || []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Add assignment
        </Button>
      </form>
    </Modal>
  );
}
