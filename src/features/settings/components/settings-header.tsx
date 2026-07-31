import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { uiZh } from "@/config/ui-zh";
import type { SettingsSectionDefinition } from "@/features/settings/lib/settings-sections";
import { SETTINGS_HUB_HREF } from "@/features/settings/lib/settings-sections";

type SettingsHeaderProps = {
  section: SettingsSectionDefinition;
  workspaceName?: string | null;
  companyName?: string | null;
};

export function SettingsHeader({
  section,
  workspaceName = null,
  companyName = null,
}: SettingsHeaderProps) {
  const lifecycle = [workspaceName, companyName].filter(Boolean).join(" · ");

  return (
    <WorkspaceHeader
      eyebrow={uiZh.platformSettings}
      title={section.label}
      lifecycle={lifecycle || section.description}
      breadcrumbs={[
        { label: uiZh.settings, href: SETTINGS_HUB_HREF },
        { label: section.label },
      ]}
      status={
        section.placeholder
          ? { label: uiZh.placeholderBadge, tone: "info" }
          : undefined
      }
    />
  );
}
