import { NotificationsSettingsSection } from "@/features/settings/components/sections/notifications-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function NotificationsSettingsPage() {
  const { context } = await loadSettingsPageContext();

  return (
    <SettingsShell
      activeSection="notifications"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <NotificationsSettingsSection />
    </SettingsShell>
  );
}
