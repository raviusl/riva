import { uiZh } from "@/config/ui-zh";

export const CLIENT_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "projects", label: uiZh.projects },
  { id: "meetings", label: uiZh.meetings },
  { id: "documents", label: uiZh.documents },
  { id: "timeline", label: uiZh.timeline },
  { id: "finance", label: uiZh.finance },
  { id: "activity", label: uiZh.activity },
  { id: "notes", label: uiZh.notes },
] as const;

export type ClientWorkspaceTabId =
  (typeof CLIENT_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_CLIENT_WORKSPACE_TAB: ClientWorkspaceTabId = "overview";

export function isClientWorkspaceTabId(
  value: string | null | undefined,
): value is ClientWorkspaceTabId {
  return CLIENT_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseClientWorkspaceTab(
  value: string | null | undefined,
): ClientWorkspaceTabId {
  return isClientWorkspaceTabId(value)
    ? value
    : DEFAULT_CLIENT_WORKSPACE_TAB;
}

export function buildClientWorkspaceHref(
  clientId: string,
  tab: ClientWorkspaceTabId = DEFAULT_CLIENT_WORKSPACE_TAB,
): string {
  const base = `/dashboard/clients/${clientId}`;
  if (tab === DEFAULT_CLIENT_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildClientWorkspaceTabHref(
  clientId: string,
  tab: ClientWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/clients/${clientId}`;
  if (tab === DEFAULT_CLIENT_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
