import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { homeForRole } from "../../components/ProtectedRoute";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.fullName.split(" ")[0]}.`);
      navigate(homeForRole(data.user.role));
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't log in. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-700">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Log in to your Scholify account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-navy-100/60 bg-white p-6 shadow-card">
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
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            leadingIcon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          New parent?{" "}
          <Link to="/register" className="font-medium text-action-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
