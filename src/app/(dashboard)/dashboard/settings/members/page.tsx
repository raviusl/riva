import { MembersSettingsSection } from "@/features/settings/components/sections/members-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function MembersSettingsPage() {
  const { context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="members"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <MembersSettingsSection />
    </SettingsShell>
  );
}
