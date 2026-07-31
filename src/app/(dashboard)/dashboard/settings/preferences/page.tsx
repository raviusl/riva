import { PreferencesSettingsSection } from "@/features/settings/components/sections/preferences-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function PreferencesSettingsPage() {
  const { context, sessionContext } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="preferences"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <PreferencesSettingsSection
        timezone={sessionContext?.company.timezone ?? null}
        locale={sessionContext?.company.locale ?? null}
        currency={sessionContext?.company.currency ?? null}
      />
    </SettingsShell>
  );
}
