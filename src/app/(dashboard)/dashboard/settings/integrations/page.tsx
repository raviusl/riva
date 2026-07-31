import { IntegrationsSettingsSection } from "@/features/settings/components/sections/integrations-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function IntegrationsSettingsPage() {
  const { context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="integrations"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <IntegrationsSettingsSection />
    </SettingsShell>
  );
}
