import { uiZh } from "@/config/ui-zh";

export const AUTOMATION_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "workflow", label: uiZh.workflow },
  { id: "trigger", label: uiZh.trigger },
  { id: "conditions", label: uiZh.conditions },
  { id: "actions", label: uiZh.actionSteps },
  { id: "history", label: uiZh.historyComingSoon },
  { id: "logs", label: uiZh.logsComingSoon },
] as const;

export type AutomationWorkspaceTabId =
  (typeof AUTOMATION_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_AUTOMATION_WORKSPACE_TAB: AutomationWorkspaceTabId =
  "overview";

export const AUTOMATION_WORKSPACE_PREVIEW_ID = "preview";

export function isAutomationWorkspaceTabId(
  value: string | null | undefined,
): value is AutomationWorkspaceTabId {
  return AUTOMATION_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseAutomationWorkspaceTab(
  value: string | null | undefined,
): AutomationWorkspaceTabId {
  return isAutomationWorkspaceTabId(value)
    ? value
    : DEFAULT_AUTOMATION_WORKSPACE_TAB;
}

export function buildAutomationWorkspaceHref(
  automationId: string,
  tab: AutomationWorkspaceTabId = DEFAULT_AUTOMATION_WORKSPACE_TAB,
): string {
  const base = `/dashboard/automations/${automationId}`;
  if (tab === DEFAULT_AUTOMATION_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildAutomationWorkspaceTabHref(
  automationId: string,
  tab: AutomationWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/automations/${automationId}`;
  if (
    tab === DEFAULT_AUTOMATION_WORKSPACE_TAB &&
    !options?.explicitOverview
  ) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
