"use client";

import {
  WorkspaceHeader,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import { automationStatusLabel } from "@/features/automation/lib/automation-labels";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type AutomationWorkspaceHeaderProps = {
  automation: AutomationWorkspaceModel;
};

function statusTone(
  status: AutomationWorkspaceModel["status"],
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "active":
      return "success";
    case "paused":
      return "warning";
    case "draft":
      return "info";
    case "archived":
      return "default";
  }
}

export function AutomationWorkspaceHeader({
  automation,
}: AutomationWorkspaceHeaderProps) {
  return (
    <WorkspaceHeader
      eyebrow={uiZh.automationWorkspaceEyebrow}
      title={automation.name}
      status={{
        label: automation.enabled
          ? `${automationStatusLabel(automation.status)} · Enabled`
          : `${automationStatusLabel(automation.status)} · Disabled`,
        tone: automation.enabled
          ? statusTone(automation.status)
          : "default",
      }}
      lifecycle={automation.description ?? undefined}
      breadcrumbs={buildWorkspaceBreadcrumbs("automation")}
    />
  );
}
