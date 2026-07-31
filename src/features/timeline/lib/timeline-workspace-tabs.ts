import { uiZh } from "@/config/ui-zh";

export const TIMELINE_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "timeline", label: uiZh.timeline },
  { id: "calendar", label: uiZh.calendar },
  { id: "upcoming", label: uiZh.upcoming },
  { id: "past", label: uiZh.past },
] as const;

export type TimelineWorkspaceTabId =
  (typeof TIMELINE_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_TIMELINE_WORKSPACE_TAB: TimelineWorkspaceTabId =
  "overview";

export const TIMELINE_WORKSPACE_HUB_ID = "workspace";

export function isTimelineWorkspaceTabId(
  value: string | null | undefined,
): value is TimelineWorkspaceTabId {
  return TIMELINE_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseTimelineWorkspaceTab(
  value: string | null | undefined,
): TimelineWorkspaceTabId {
  return isTimelineWorkspaceTabId(value)
    ? value
    : DEFAULT_TIMELINE_WORKSPACE_TAB;
}

export function buildTimelineWorkspaceHref(
  workspaceId: string,
  tab: TimelineWorkspaceTabId = DEFAULT_TIMELINE_WORKSPACE_TAB,
): string {
  const base = `/dashboard/timeline/${workspaceId}`;
  if (tab === DEFAULT_TIMELINE_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildTimelineWorkspaceTabHref(
  workspaceId: string,
  tab: TimelineWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/timeline/${workspaceId}`;
  if (tab === DEFAULT_TIMELINE_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
