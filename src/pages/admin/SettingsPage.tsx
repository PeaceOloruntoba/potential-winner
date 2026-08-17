import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiErrorMessage } from "../../lib/api";
import { AppShell } from "../../components/layout/AppShell";
import { adminNavItems } from "./adminNav";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { CardSkeleton } from "../../components/ui/Skeleton";

interface Settings {
  school_name: string;
  logo_url: string | null;
  address: string | null;
  show_class_position: boolean;
  paystack_subaccount_code: string;
  admission_prefix: string;
  current_session: string;
  current_term: number;
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then(({ data }) => setSettings(data.settings))
      .catch((err) => toast.error(apiErrorMessage(err, "Couldn't load settings.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      const { data } = await api.patch("/admin/settings", {
        schoolName: settings.school_name,
        logoUrl: settings.logo_url || undefined,
        address: settings.address || undefined,
        showClassPosition: settings.show_class_position,
        paystackSubaccountCode: settings.paystack_subaccount_code,
        admissionPrefix: settings.admission_prefix,
      });
      setSettings(data.settings);
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't save settings."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell navItems={adminNavItems} pageTitle="School settings">
      <div className="mb-5 md:hidden">
        <h1 className="font-display text-xl font-bold text-ink-900">School settings</h1>
      </div>

      {isLoading || !settings ? (
        <CardSkeleton />
      ) : (
        <Card className="max-w-xl">
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="School name"
                required
                value={settings.school_name}
                onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                disabled={isSaving}
              />
              <Input
                label="Address"
                value={settings.address || ""}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                disabled={isSaving}
              />
              <Input
                label="Logo URL"
                value={settings.logo_url || ""}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                disabled={isSaving}
                hint="Upload your logo to Cloudinary or elsewhere and paste the URL here."
              />
              <Input
                label="Admission number prefix"
                required
                value={settings.admission_prefix}
                onChange={(e) => setSettings({ ...settings, admission_prefix: e.target.value })}
                disabled={isSaving}
                hint={`Example: ${settings.admission_prefix}/${new Date().getFullYear()}/104`}
              />
              <Input
                label="Paystack subaccount code"
                required
                value={settings.paystack_subaccount_code}
                onChange={(e) => setSettings({ ...settings, paystack_subaccount_code: e.target.value })}
                disabled={isSaving}
                hint="From your school's Paystack dashboard, once the agency subaccount is added."
              />
              <label className="flex items-center gap-2.5 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={settings.show_class_position}
                  onChange={(e) => setSettings({ ...settings, show_class_position: e.target.checked })}
                  disabled={isSaving}
                  className="h-4 w-4 rounded border-navy-200 text-action-500 focus:ring-action-500"
                />
                Show class position on broadsheets and report cards
              </label>
              <div className="rounded-lg bg-surface-muted px-3.5 py-2.5 text-sm text-ink-500">
                Currently on <span className="font-medium text-ink-700">{settings.current_session} · Term {settings.current_term}</span> —
                change this from the Fees & Terms page.
              </div>
              <Button type="submit" fullWidth isLoading={isSaving}>
                Save settings
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </AppShell>
  );
}
