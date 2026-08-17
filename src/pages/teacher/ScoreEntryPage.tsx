import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { teacherNavItems } from "./teacherNav";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Users } from "lucide-react";

interface Scheme {
  id: string;
  name: string;
  max_score: string;
}
interface GridRow {
  studentId: string;
  admissionNumber: string | null;
  firstName: string;
  lastName: string;
  scores: Record<string, number>;
}

export function ScoreEntryPage() {
  const { classroomId, subjectId } = useParams<{ classroomId: string; subjectId: string }>();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);
  const [rows, setRows] = useState<GridRow[] | null>(null);
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState("");
  const [term, setTerm] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const { data: termData } = await api.get("/meta/current-term");
        if (cancelled) return;
        setSession(termData.session);
        setTerm(termData.term);

        const [schemesRes, gridRes] = await Promise.all([
          api.get("/meta/assessment-schemes", { params: { session: termData.session, term: termData.term } }),
          api.get(`/scores/grid/${classroomId}/${subjectId}`, {
            params: { session: termData.session, term: termData.term },
          }),
        ]);
        if (cancelled) return;
        setSchemes(schemesRes.data.schemes);
        setRows(gridRes.data.grid);
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't load the score grid."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classroomId, subjectId]);

  const hasEdits = useMemo(() => Object.keys(edits).length > 0, [edits]);

  function handleCellChange(studentId: string, assessmentId: string, value: string) {
    setEdits((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [assessmentId]: value },
    }));
  }

  function cellValue(row: GridRow, assessmentId: string): string {
    const edited = edits[row.studentId]?.[assessmentId];
    if (edited !== undefined) return edited;
    const existing = row.scores[assessmentId];
    return existing !== undefined ? String(existing) : "";
  }

  async function handleSave() {
    if (!rows || !schemes) return;
    const scores: { studentId: string; assessmentId: string; score: number }[] = [];
    for (const row of rows) {
      for (const scheme of schemes) {
        const raw = cellValue(row, scheme.id);
        if (raw === "") continue;
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0) {
          toast.error(`Invalid score for ${row.firstName} ${row.lastName} — ${scheme.name}.`);
          return;
        }
        if (num > Number(scheme.max_score)) {
          toast.error(`${row.firstName} ${row.lastName}'s ${scheme.name} score exceeds the max of ${scheme.max_score}.`);
          return;
        }
        scores.push({ studentId: row.studentId, assessmentId: scheme.id, score: num });
      }
    }
    if (scores.length === 0) {
      toast.error("No scores entered yet.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post("/scores/batch", { classroomId, subjectId, session, term, scores });
      toast.success(`${scores.length} score(s) saved.`);
      setEdits({});
      const { data } = await api.get(`/scores/grid/${classroomId}/${subjectId}`, { params: { session, term } });
      setRows(data.grid);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't save scores."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell navItems={teacherNavItems} pageTitle="Score entry">
      <button
        onClick={() => navigate("/teacher")}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to my classes
      </button>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : !schemes || schemes.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No assessment scheme set for this term"
          description="Ask your admin to set up CA/Exam components for the current term before scores can be entered."
        />
      ) : !rows || rows.length === 0 ? (
        <EmptyState icon={Users} title="No students in this class yet" />
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-navy-100 bg-surface-muted/50">
                  <th className="sticky left-0 z-10 bg-surface-muted/50 px-4 py-3 text-left font-medium text-ink-500">
                    Student
                  </th>
                  {schemes.map((s) => (
                    <th key={s.id} className="px-3 py-3 text-center font-medium text-ink-500">
                      {s.name}
                      <span className="block text-xs font-normal text-ink-400">/{s.max_score}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-navy-100 last:border-0">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-ink-900">
                      {row.firstName} {row.lastName}
                    </td>
                    {schemes.map((scheme) => (
                      <td key={scheme.id} className="px-2 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          max={Number(scheme.max_score)}
                          value={cellValue(row, scheme.id)}
                          onChange={(e) => handleCellChange(row.studentId, scheme.id, e.target.value)}
                          disabled={isSaving}
                          className="w-16 rounded-lg border border-navy-100 px-2 py-1.5 text-center text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-action-500 disabled:bg-surface-muted"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="sticky bottom-20 md:bottom-4 mt-5 flex justify-end">
            <Button onClick={handleSave} isLoading={isSaving} disabled={!hasEdits && !isSaving}>
              <Save className="h-4 w-4" /> Save scores
            </Button>
          </div>
        </>
      )}
    </AppShell>
  );
}
