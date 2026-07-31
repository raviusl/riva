import type { ReactNode } from "react";

import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";

type WorkspaceSettingsSectionProps = {
  workspaceName: string;
  canWrite: boolean;
  children: ReactNode;
};

/**
 * Workspace settings section shell — reuses existing WorkspaceSettingsForm as children.
 */
export function WorkspaceSettingsSection({
  workspaceName,
  canWrite,
  children,
}: WorkspaceSettingsSectionProps) {
  return (
    <SettingsSectionCard
      title={uiZh.workspaceProfile}
      description={
        canWrite
          ? uiZh.editSettingsFor(workspaceName)
          : uiZh.viewingNoWriteAccess(workspaceName)
      }
    >
      {children}
    </SettingsSectionCard>
  );
}
