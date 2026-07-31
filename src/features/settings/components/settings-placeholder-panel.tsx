import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";

type SettingsPlaceholderPanelProps = {
  title: string;
  description: string;
};

export function SettingsPlaceholderPanel({
  title,
  description,
}: SettingsPlaceholderPanelProps) {
  return (
    <SettingsSectionCard title={title} description={description}>
      <WorkspaceComingSoon title={title} description={description} />
    </SettingsSectionCard>
  );
}
