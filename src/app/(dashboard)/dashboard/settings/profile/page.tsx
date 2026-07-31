import { ProfileSettingsSection } from "@/features/settings/components/sections/profile-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function ProfileSettingsPage() {
  const { profile, context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="profile"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <ProfileSettingsSection profile={profile} />
    </SettingsShell>
  );
}
