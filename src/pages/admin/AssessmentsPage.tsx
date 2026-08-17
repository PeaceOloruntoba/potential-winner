import { FormEvent, useEffect, useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface Scheme {
  id: string;
  name: string;
  max_score: string;
  term: number;
  session: string;
}

export function AssessmentsPage() {
  const [session, setSession] = useState("");
  const [term, setTerm] = useState("1");
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [totalMaxScore, setTotalMaxScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/meta/current-term")
      .then(({ data }) => {
        setSession(data.session);
        setTerm(String(data.term));
      })
      .catch(() => {});
  }, []);

  async function load() {
    if (!session || !term) return;
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/assessment-schemes", { params: { session, term } });
      setSchemes(data.schemes);
      setTotalMaxScore(data.totalMaxScore);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load assessment schemes."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, term]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name || !maxScore) return;
    setIsSubmitting(true);
    try {
      await api.post("/admin/assessment-schemes", {
        name,
        maxScore: Number(maxScore),
        term: Number(term),
        session,
      });
      toast.success(`"${name}" added.`);
      setName("");
      setMaxScore("");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't add that component."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(schemeId: string) {
    setDeletingId(schemeId);
    try {
      await api.delete(`/admin/assessment-schemes/${schemeId}`);
      toast.success("Removed.");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't remove that component."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="Assessment structure">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">Assessment structure</h1>
      </div>
      <p className="mb-5 max-w-xl text-sm text-ink-500">
        Define however many CA/Exam components this term needs — 2 CAs + 1 Exam, 4 CAs + 1 Exam, whatever fits.
        Every subject in every classroom uses the same structure for a given term.
      </p>

      <Card className="mb-5">
        <CardBody>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <Input label="Session" placeholder="2026/2027" value={session} onChange={(e) => setSession(e.target.value)} />
            <Input label="Term" type="number" min={1} max={3} value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Component name"
              placeholder="e.g. CA1, Exam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="sm:flex-1"
            />
            <Input
              label="Max score"
              type="number"
              min={1}
              placeholder="20"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              disabled={isSubmitting}
              className="sm:w-32"
            />
            <Button type="submit" isLoading={isSubmitting} disabled={!name || !maxScore}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
        </CardBody>
      </Card>

      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : !schemes || schemes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No components set for this term" description="Add at least one above to get started." />
      ) : (
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-ink-500">
                {session} · Term {term}
              </p>
              <Badge tone={totalMaxScore === 100 ? "success" : "warning"}>Sums to {totalMaxScore}</Badge>
            </div>
            <div className="space-y-2">
              {schemes.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-navy-100 py-2 last:border-0">
                  <p className="text-sm font-medium text-ink-900">
                    {s.name} <span className="font-normal text-ink-400">/ {s.max_score}</span>
                  </p>
                  <button
                    disabled={deletingId === s.id}
                    onClick={() => handleDelete(s.id)}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </AppShell>
  );
}
