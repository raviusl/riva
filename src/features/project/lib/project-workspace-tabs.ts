import { uiZh } from "@/config/ui-zh";

/**
 * Project 097 — Wedding Project Workspace tabs.
 * Navigation only for modules not yet built (Coming Soon).
 */
export const PROJECT_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "timeline", label: uiZh.timeline },
  { id: "tasks", label: uiZh.tasks },
  { id: "meetings", label: uiZh.meetings },
  { id: "schedule", label: uiZh.schedule },
  { id: "vendors", label: uiZh.vendors },
  { id: "package", label: uiZh.packageTab },
  { id: "documents", label: uiZh.documents },
  { id: "gallery", label: uiZh.gallery },
  { id: "notes", label: uiZh.notes },
  { id: "finance", label: uiZh.financeComingSoon },
] as const;

export type ProjectWorkspaceTabId =
  (typeof PROJECT_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_PROJECT_WORKSPACE_TAB: ProjectWorkspaceTabId = "overview";

export const PROJECT_WORKSPACE_PLACEHOLDER_TABS = [
  "meetings",
  "schedule",
  "documents",
  "gallery",
  "notes",
  "finance",
] as const satisfies readonly ProjectWorkspaceTabId[];

export function isProjectWorkspaceTabId(
  value: string | null | undefined,
): value is ProjectWorkspaceTabId {
  return PROJECT_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseProjectWorkspaceTab(
  value: string | null | undefined,
): ProjectWorkspaceTabId {
  return isProjectWorkspaceTabId(value)
    ? value
    : DEFAULT_PROJECT_WORKSPACE_TAB;
}

export function buildProjectWorkspaceHref(
  projectId: string,
  tab: ProjectWorkspaceTabId = DEFAULT_PROJECT_WORKSPACE_TAB,
): string {
  const base = `/dashboard/projects/${projectId}`;
  if (tab === DEFAULT_PROJECT_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildProjectWorkspaceTabHref(
  projectId: string,
  tab: ProjectWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/projects/${projectId}`;
  if (tab === DEFAULT_PROJECT_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
