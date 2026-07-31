import { uiZh } from "@/config/ui-zh";

export const NOTIFICATION_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "inbox", label: uiZh.inbox },
  { id: "scheduled", label: uiZh.tabScheduled },
  { id: "templates", label: uiZh.templates },
  { id: "activity", label: uiZh.activity },
] as const;

export type NotificationWorkspaceTabId =
  (typeof NOTIFICATION_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_NOTIFICATION_WORKSPACE_TAB: NotificationWorkspaceTabId =
  "overview";

export const NOTIFICATION_WORKSPACE_HUB_ID = "workspace";

export function isNotificationWorkspaceTabId(
  value: string | null | undefined,
): value is NotificationWorkspaceTabId {
  return NOTIFICATION_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseNotificationWorkspaceTab(
  value: string | null | undefined,
): NotificationWorkspaceTabId {
  return isNotificationWorkspaceTabId(value)
    ? value
    : DEFAULT_NOTIFICATION_WORKSPACE_TAB;
}

export function buildNotificationWorkspaceHref(
  workspaceId: string,
  tab: NotificationWorkspaceTabId = DEFAULT_NOTIFICATION_WORKSPACE_TAB,
): string {
  const base = `/dashboard/notifications/${workspaceId}`;
  if (tab === DEFAULT_NOTIFICATION_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildNotificationWorkspaceTabHref(
  workspaceId: string,
  tab: NotificationWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/notifications/${workspaceId}`;
  if (
    tab === DEFAULT_NOTIFICATION_WORKSPACE_TAB &&
    !options?.explicitOverview
  ) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
