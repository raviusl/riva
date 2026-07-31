import { uiZh } from "@/config/ui-zh";

export const MEETING_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "agenda", label: uiZh.agenda },
  { id: "notes", label: uiZh.notes },
  { id: "decisions", label: uiZh.decisions },
  { id: "attachments", label: uiZh.attachments },
  { id: "activity", label: uiZh.activity },
] as const;

export type MeetingWorkspaceTabId =
  (typeof MEETING_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_MEETING_WORKSPACE_TAB: MeetingWorkspaceTabId = "overview";

export function isMeetingWorkspaceTabId(
  value: string | null | undefined,
): value is MeetingWorkspaceTabId {
  return MEETING_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseMeetingWorkspaceTab(
  value: string | null | undefined,
): MeetingWorkspaceTabId {
  return isMeetingWorkspaceTabId(value)
    ? value
    : DEFAULT_MEETING_WORKSPACE_TAB;
}

export function buildMeetingWorkspaceHref(
  meetingId: string,
  tab: MeetingWorkspaceTabId = DEFAULT_MEETING_WORKSPACE_TAB,
): string {
  const base = `/dashboard/meetings/${meetingId}`;
  if (tab === DEFAULT_MEETING_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildMeetingWorkspaceTabHref(
  meetingId: string,
  tab: MeetingWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/meetings/${meetingId}`;
  if (tab === DEFAULT_MEETING_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
