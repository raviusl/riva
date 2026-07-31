"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { AutomationWorkspaceActionsPanel } from "@/features/automation/components/automation-workspace-actions-panel";
import { AutomationWorkspaceConditionsPanel } from "@/features/automation/components/automation-workspace-conditions-panel";
import { AutomationWorkspaceHeader } from "@/features/automation/components/automation-workspace-header";
import { AutomationWorkspaceOverview } from "@/features/automation/components/automation-workspace-overview";
import { AutomationWorkspaceTriggerPanel } from "@/features/automation/components/automation-workspace-trigger-panel";
import { AutomationWorkspaceWorkflowPanel } from "@/features/automation/components/automation-workspace-workflow-panel";
import type { AutomationWorkspaceModel } from "@/features/automation/lib/automation-types";
import {
  AUTOMATION_WORKSPACE_TABS,
  DEFAULT_AUTOMATION_WORKSPACE_TAB,
  buildAutomationWorkspaceTabHref,
  parseAutomationWorkspaceTab,
  type AutomationWorkspaceTabId,
} from "@/features/automation/lib/automation-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type AutomationWorkspaceProps = {
  automation: AutomationWorkspaceModel;
  initialTab?: AutomationWorkspaceTabId;
};

export function AutomationWorkspace({
  automation,
  initialTab = DEFAULT_AUTOMATION_WORKSPACE_TAB,
}: AutomationWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseAutomationWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseAutomationWorkspaceTab(tabId);
      return buildAutomationWorkspaceTabHref(automation.id, tab, {
        explicitOverview: true,
      });
    },
    [automation.id],
  );

  return (
    <div className="space-y-6">
      <AutomationWorkspaceHeader automation={automation} />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={AUTOMATION_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <AutomationWorkspaceOverview automation={automation} />
        ) : null}

        {activeTab === "workflow" ? (
          <AutomationWorkspaceWorkflowPanel automation={automation} />
        ) : null}

        {activeTab === "trigger" ? (
          <AutomationWorkspaceTriggerPanel automation={automation} />
        ) : null}

        {activeTab === "conditions" ? (
          <AutomationWorkspaceConditionsPanel automation={automation} />
        ) : null}

        {activeTab === "actions" ? (
          <AutomationWorkspaceActionsPanel automation={automation} />
        ) : null}

        {activeTab === "history" ? (
          <WorkspaceComingSoon
            title={uiZh.history}
            description={uiZh.automationHistoryDesc}
          />
        ) : null}

        {activeTab === "logs" ? (
          <WorkspaceComingSoon
            title={uiZh.logs}
            description={uiZh.automationLogsDesc}
          />
        ) : null}
      </div>
    </div>
  );
}
