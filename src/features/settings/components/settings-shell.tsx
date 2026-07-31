import type { ReactNode } from "react";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { SettingsHeader } from "@/features/settings/components/settings-header";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import type { SettingsSectionId } from "@/features/settings/lib/settings-sections";
import { getSettingsSection } from "@/features/settings/lib/settings-sections";

type SettingsShellProps = {
  activeSection: SettingsSectionId;
  workspaceName?: string | null;
  companyName?: string | null;
  children: ReactNode;
};

/**
 * Shared Settings chrome — WorkspaceLayout + section nav + header.
 */
export function SettingsShell({
  activeSection,
  workspaceName = null,
  companyName = null,
  children,
}: SettingsShellProps) {
  const section = getSettingsSection(activeSection);

  return (
    <WorkspaceLayout
      backHref="/dashboard"
      backLabel={uiZh.backToDashboard}
      fallbackLabel={uiZh.loadingSettings}
    >
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <SettingsNav activeSection={activeSection} />
        </aside>

        <div className="min-w-0 space-y-6">
          <SettingsHeader
            section={section}
            workspaceName={workspaceName}
            companyName={companyName}
          />
          {children}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
