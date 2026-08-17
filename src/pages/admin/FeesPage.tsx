import { FormEvent, useEffect, useState } from "react";
import { Wallet, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ListSkeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface TermFee {
  id: string;
  session: string;
  term: number;
  amount: string;
}

export function FeesPage() {
  const [currentTerm, setCurrentTerm] = useState<{ session: string; term: number } | null>(null);
  const [termFees, setTermFees] = useState<TermFee[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [feeSession, setFeeSession] = useState("");
  const [feeTerm, setFeeTerm] = useState("1");
  const [feeAmount, setFeeAmount] = useState("");
  const [isSavingFee, setIsSavingFee] = useState(false);

  const [advSession, setAdvSession] = useState("");
  const [advTerm, setAdvTerm] = useState("1");
  const [isAdvancing, setIsAdvancing] = useState(false);

  async function load() {
    setIsLoading(true);
    try {
      const [termRes, feesRes] = await Promise.all([
        api.get("/meta/current-term"),
        api.get("/admin/term-fees"),
      ]);
      setCurrentTerm(termRes.data);
      setTermFees(feesRes.data.termFees);
      setFeeSession(termRes.data.session);
      setAdvSession(termRes.data.session);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't load fee data."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSetFee(e: FormEvent) {
    e.preventDefault();
    setIsSavingFee(true);
    try {
      await api.post("/admin/term-fees", { session: feeSession, term: Number(feeTerm), amount: Number(feeAmount) });
      toast.success("Term fee saved.");
      setFeeAmount("");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't save the term fee."));
    } finally {
      setIsSavingFee(false);
    }
  }

  async function handleAdvance(e: FormEvent) {
    e.preventDefault();
    setIsAdvancing(true);
    try {
      const { data } = await api.post("/admin/advance-term", { session: advSession, term: Number(advTerm) });
      toast.success(
        `Advanced to ${advSession} term ${advTerm} — ${data.invoicesCreated} invoice(s) created for ${data.activeStudentCount} active student(s).`
      );
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't advance the term. Make sure a fee is set first."));
    } finally {
      setIsAdvancing(false);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="Fees & Terms">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">Fees & Terms</h1>
      </div>

      {currentTerm && (
        <p className="mb-5 text-sm text-ink-500">
          Currently on <span className="font-medium text-ink-700">{currentTerm.session} · Term {currentTerm.term}</span>
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-1 font-display font-semibold text-ink-900">Set term fee</h2>
            <p className="mb-4 text-sm text-ink-500">
              One flat fee for the whole school per term. Individual invoices can still be edited afterward for a
              scholarship or discount.
            </p>
            <form onSubmit={handleSetFee} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Session" required value={feeSession} onChange={(e) => setFeeSession(e.target.value)} disabled={isSavingFee} />
                <Input label="Term" type="number" min={1} max={3} required value={feeTerm} onChange={(e) => setFeeTerm(e.target.value)} disabled={isSavingFee} />
              </div>
              <Input
                label="Amount (₦)"
                type="number"
                min={1}
                required
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                disabled={isSavingFee}
              />
              <Button type="submit" fullWidth isLoading={isSavingFee}>
                Save fee
              </Button>
            </form>

            {isLoading ? (
              <div className="mt-5">
                <ListSkeleton rows={1} />
              </div>
            ) : termFees && termFees.length > 0 ? (
              <div className="mt-5 space-y-1.5 border-t border-navy-100 pt-4">
                {termFees.map((f) => (
                  <div key={f.id} className="flex justify-between text-sm">
                    <span className="text-ink-500">
                      {f.session} · Term {f.term}
                    </span>
                    <span className="font-medium text-ink-900">₦{Number(f.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState icon={Wallet} title="No fees set yet" />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-1 font-display font-semibold text-ink-900">Advance term</h2>
            <p className="mb-4 text-sm text-ink-500">
              Moves the school forward and bulk-generates invoices for every enrolled student using the fee set on
              the left. Set that fee first, or this will fail.
            </p>
            <form onSubmit={handleAdvance} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="New session" required value={advSession} onChange={(e) => setAdvSession(e.target.value)} disabled={isAdvancing} />
                <Input label="New term" type="number" min={1} max={3} required value={advTerm} onChange={(e) => setAdvTerm(e.target.value)} disabled={isAdvancing} />
              </div>
              <Button type="submit" variant="secondary" fullWidth isLoading={isAdvancing}>
                <ArrowRightCircle className="h-4 w-4" /> Advance term & generate invoices
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
