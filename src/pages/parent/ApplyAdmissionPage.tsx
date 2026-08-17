import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import type { Classroom } from "../../types";
import { AppShell } from "../../components/layout/AppShell";
import { parentNavItems } from "./parentNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { PassportUpload } from "../../components/ui/PassportUpload";
import { Skeleton } from "../../components/ui/Skeleton";

export function ApplyAdmissionPage() {
  const [classrooms, setClassrooms] = useState<Classroom[] | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/meta/classrooms")
      .then(({ data }) => setClassrooms(data.classrooms))
      .catch(() => setClassrooms([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!classroomId) {
      toast.error("Please select a classroom.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/admissions/apply", {
        firstName,
        lastName,
        dateOfBirth,
        classroomId,
        passportUrl: passportUrl ?? undefined,
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't submit the application."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AppShell navItems={parentNavItems} pageTitle="Apply for admission">
        <Card className="mx-auto max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
            <CheckCircle2 className="h-7 w-7 text-success-500" />
          </div>
          <h2 className="font-display text-lg font-bold text-ink-900">Application submitted</h2>
          <p className="mt-2 text-sm text-ink-500">
            You'll see it on your dashboard while it's under review. We'll notify you once it's approved.
          </p>
          <Button fullWidth className="mt-6" onClick={() => navigate("/parent")}>
            Back to dashboard
          </Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell navItems={parentNavItems} pageTitle="Apply for admission">
      <Card className="mx-auto max-w-lg">
        <CardBody>
          <p className="mb-5 text-sm text-ink-500">
            Submit one application per child. You can apply for another child separately afterward.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                label="Last name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Input
              label="Date of birth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={isSubmitting}
            />
            {classrooms === null ? (
              <Skeleton className="h-11 w-full" />
            ) : (
              <Select
                label="Classroom applying to"
                required
                placeholder="Select a classroom"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
                disabled={isSubmitting || classrooms.length === 0}
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            )}
            <PassportUpload value={passportUrl} onChange={setPassportUrl} />
            <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-2">
              Submit application
            </Button>
          </form>
        </CardBody>
      </Card>
    </AppShell>
  );
}
