import { SecuritySettingsSection } from "@/features/settings/components/sections/security-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function SecuritySettingsPage() {
  const { context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="security"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <SecuritySettingsSection />
    </SettingsShell>
  );
}
