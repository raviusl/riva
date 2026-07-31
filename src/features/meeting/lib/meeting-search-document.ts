/**
 * Meeting → Global Search document adapter (Project 054).
 */

import type { Meeting } from "@/core/meeting/types";
import {
  meetingStatusLabel,
  meetingTypeLabel,
} from "@/features/meeting/lib/meeting-labels";
import type { GlobalSearchDocument } from "@/features/search/search-result";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export function toMeetingSearchDocument(
  meeting: Meeting,
): GlobalSearchDocument & { href: string } {
  const keywords = [
    meeting.title,
    meeting.location,
    meeting.google_meet_link,
    meeting.notes,
    meetingStatusLabel(meeting.status),
    meetingTypeLabel(meeting.meeting_type),
    ...meeting.participants.map((participant) => participant.name),
  ].filter((value): value is string => Boolean(value && value.trim()));

  return {
    id: `meeting:${meeting.id}`,
    entityType: "meeting",
    entityId: meeting.id,
    companyId: meeting.company_id,
    workspaceId: meeting.workspace_id,
    title: meeting.title,
    subtitle: [
      meetingTypeLabel(meeting.meeting_type),
      meetingStatusLabel(meeting.status),
      meeting.meeting_date,
      meeting.location,
    ]
      .filter(Boolean)
      .join(" · "),
    keywords,
    tags: [meeting.status, meeting.meeting_type],
    createdAt: meeting.created_at,
    updatedAt: meeting.updated_at,
    href: buildWorkspaceOverviewHref("meeting", meeting.id),
  };
}

export function toMeetingSearchDocuments(
  meetings: readonly Meeting[],
): Array<GlobalSearchDocument & { href: string }> {
  return meetings
    .filter((meeting) => meeting.status !== "cancelled")
    .map(toMeetingSearchDocument);
}
