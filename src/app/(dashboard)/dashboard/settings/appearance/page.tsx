import { AppearanceSettingsSection } from "@/features/settings/components/sections/appearance-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function AppearanceSettingsPage() {
  const { context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="appearance"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <AppearanceSettingsSection />
    </SettingsShell>
  );
}
