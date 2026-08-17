import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/auth/register-parent", { fullName, email, phone, password });
      setSubmitted(true);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
        <div className="w-full max-w-sm rounded-xl2 border border-navy-100/60 bg-white p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50">
            <CheckCircle2 className="h-7 w-7 text-success-500" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900">Account submitted</h1>
          <p className="mt-2 text-sm text-ink-500">
            Your account is pending admin approval. You'll be able to log in once it's approved.
          </p>
          <Button fullWidth className="mt-6" onClick={() => navigate("/login")}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-700">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">For parents enrolling a child at the school</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-navy-100/60 bg-white p-6 shadow-card">
          <Input
            label="Full name"
            required
            leadingIcon={<User className="h-4 w-4" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Adebayo"
            disabled={isSubmitting}
          />
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            leadingIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
          <Input
            label="Phone number"
            type="tel"
            required
            leadingIcon={<Phone className="h-4 w-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 800 000 0000"
            disabled={isSubmitting}
          />
          <Input
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            leadingIcon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            hint="At least 8 characters."
            disabled={isSubmitting}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-action-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
