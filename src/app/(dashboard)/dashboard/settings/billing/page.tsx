import { BillingSettingsSection } from "@/features/settings/components/sections/billing-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function BillingSettingsPage() {
  const { context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="billing"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <BillingSettingsSection />
    </SettingsShell>
  );
}
