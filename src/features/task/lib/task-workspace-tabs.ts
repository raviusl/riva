import { uiZh } from "@/config/ui-zh";

export const TASK_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "tasks", label: uiZh.tasks },
  { id: "checklist", label: uiZh.checklist },
  { id: "attachments", label: uiZh.attachments },
  { id: "activity", label: uiZh.activity },
] as const;

export type TaskWorkspaceTabId =
  (typeof TASK_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_TASK_WORKSPACE_TAB: TaskWorkspaceTabId = "overview";

export function isTaskWorkspaceTabId(
  value: string | null | undefined,
): value is TaskWorkspaceTabId {
  return TASK_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseTaskWorkspaceTab(
  value: string | null | undefined,
): TaskWorkspaceTabId {
  return isTaskWorkspaceTabId(value)
    ? value
    : DEFAULT_TASK_WORKSPACE_TAB;
}

export function buildTaskWorkspaceHref(
  workspaceId: string,
  tab: TaskWorkspaceTabId = DEFAULT_TASK_WORKSPACE_TAB,
): string {
  const base = `/dashboard/tasks/${workspaceId}`;
  if (tab === DEFAULT_TASK_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildTaskWorkspaceTabHref(
  workspaceId: string,
  tab: TaskWorkspaceTabId,
  options?: { explicitOverview?: boolean; taskId?: string | null },
): string {
  const base = `/dashboard/tasks/${workspaceId}`;
  const params = new URLSearchParams();

  if (tab !== DEFAULT_TASK_WORKSPACE_TAB || options?.explicitOverview) {
    params.set("tab", tab);
  }
  if (options?.taskId) {
    params.set("task", options.taskId);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
