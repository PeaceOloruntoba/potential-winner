import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, CreditCard, Lock, Receipt } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import type { Child, Invoice, Transaction } from "../../types";
import { AppShell } from "../../components/layout/AppShell";
import { parentNavItems } from "./parentNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge, BalancePill } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/Skeleton";

export function ChildDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const [childrenRes, invoiceRes] = await Promise.allSettled([
          api.get("/parents/children"),
          api.get(`/invoices/student/${studentId}`),
        ]);
        if (cancelled) return;
        if (childrenRes.status === "fulfilled") {
          const found = childrenRes.value.data.children.find((c: Child) => c.id === studentId);
          setChild(found ?? null);
        }
        if (invoiceRes.status === "fulfilled") {
          setInvoice(invoiceRes.value.data.invoice);
          setTransactions(invoiceRes.value.data.transactions);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  async function handleDownloadReportCard() {
    setIsDownloading(true);
    try {
      const res = await api.get(`/reports/student/${studentId}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${child?.firstName || "student"}-report-card.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report card downloaded.");
    } catch (err: any) {
      // With responseType "blob", an error response body also arrives as a
      // Blob — has to be read back to text/JSON to get the real error code
      // (e.g. DEBT_RESTRICTION) instead of a generic failure message.
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.error === "DEBT_RESTRICTION") {
            toast.error(`Report card locked — ₦${Number(parsed.balance).toLocaleString()} still owed this term.`);
          } else {
            toast.error(apiErrorMessage({ response: { data: parsed } }));
          }
        } catch {
          toast.error("Couldn't download the report card.");
        }
      } else {
        toast.error(apiErrorMessage(err, "Couldn't download the report card."));
      }
    } finally {
      setIsDownloading(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell navItems={parentNavItems} pageTitle="Student">
        <CardSkeleton />
      </AppShell>
    );
  }

  if (!child) {
    return (
      <AppShell navItems={parentNavItems} pageTitle="Student">
        <p className="text-sm text-ink-500">Student not found.</p>
      </AppShell>
    );
  }

  const initials = `${child.firstName[0]}${child.lastName[0]}`.toUpperCase();
  const balance = invoice ? invoice.balance : 0;

  return (
    <AppShell navItems={parentNavItems} pageTitle={`${child.firstName} ${child.lastName}`}>
      <button
        onClick={() => navigate("/parent")}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to children
      </button>

      <Card className="mb-5 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-lg font-bold text-white">
            {initials}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">
              {child.firstName} {child.lastName}
            </h2>
            <p className="text-sm text-ink-500">{child.classroomName || "Class not yet assigned"}</p>
            {child.admissionNumber && (
              <p className="mt-0.5 text-xs text-ink-400">Admission No. {child.admissionNumber}</p>
            )}
          </div>
        </div>
        {child.admissionStatus === "PENDING_REVIEW" && (
          <div className="mt-4">
            <Badge tone="warning">Application pending review</Badge>
          </div>
        )}
      </Card>

      {child.admissionStatus === "APPROVED" && invoice && (
        <>
          <Card className="mb-5">
            <CardBody>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold text-ink-900">This term's fees</h3>
                <BalancePill amount={balance} />
              </div>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">Total fee</dt>
                  <dd className="font-medium text-ink-900">₦{Number(invoice.total_amount).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">Paid so far</dt>
                  <dd className="font-medium text-ink-900">₦{Number(invoice.amount_paid).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between border-t border-navy-100 pt-2">
                  <dt className="font-medium text-ink-700">Balance</dt>
                  <dd className="font-semibold text-ink-900">₦{balance.toLocaleString()}</dd>
                </div>
              </dl>

              {balance > 0 && (
                <Button fullWidth className="mt-5" onClick={() => setPayModalOpen(true)}>
                  <CreditCard className="h-4 w-4" /> Make a payment
                </Button>
              )}
            </CardBody>
          </Card>

          <Card className="mb-5">
            <CardBody>
              <h3 className="mb-3 font-display font-semibold text-ink-900">Report card</h3>
              {balance > 0 ? (
                <p className="mb-4 flex items-center gap-1.5 text-sm text-ink-500">
                  <Lock className="h-4 w-4" /> Locked until fees are fully paid this term.
                </p>
              ) : (
                <p className="mb-4 text-sm text-ink-500">Fees are fully paid — your report card is ready.</p>
              )}
              <Button
                variant={balance > 0 ? "outline" : "primary"}
                fullWidth
                isLoading={isDownloading}
                disabled={balance > 0}
                onClick={handleDownloadReportCard}
              >
                <Download className="h-4 w-4" /> Download report card
              </Button>
            </CardBody>
          </Card>

          {transactions.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="mb-3 flex items-center gap-2 font-display font-semibold text-ink-900">
                  <Receipt className="h-4 w-4" /> Payment history
                </h3>
                <div className="space-y-2">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border-b border-navy-100 py-2 text-sm last:border-0">
                      <div>
                        <p className="font-medium text-ink-900">₦{Number(t.amount_paid).toLocaleString()}</p>
                        <p className="text-xs text-ink-400">{new Date(t.paid_at).toLocaleDateString()}</p>
                      </div>
                      <Badge tone="success">{t.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {payModalOpen && (
        <PaymentModal
          studentId={studentId!}
          balance={balance}
          onClose={() => setPayModalOpen(false)}
        />
      )}
    </AppShell>
  );
}

function PaymentModal({ studentId, balance, onClose }: { studentId: string; balance: number; onClose: () => void }) {
  const [amount, setAmount] = useState(String(balance));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/payments/initialize", { studentId, amount: numericAmount });
      window.location.href = data.authorizationUrl;
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't start the payment."));
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Make a payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount (₦)"
          type="number"
          min={1}
          max={balance}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint={`You can pay any amount up to ₦${balance.toLocaleString()}.`}
          disabled={isSubmitting}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Continue to payment
        </Button>
      </form>
    </Modal>
  );
}
