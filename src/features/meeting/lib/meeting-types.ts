import type {
  Meeting,
  MeetingParticipant,
  MeetingStatus,
  MeetingType,
} from "@/core/meeting/types";

export type { MeetingParticipant, MeetingStatus, MeetingType };

export const MEETING_DECISION_STATUSES = [
  "proposed",
  "accepted",
  "rejected",
  "deferred",
] as const;
export type MeetingDecisionStatus = (typeof MEETING_DECISION_STATUSES)[number];

export type MeetingAgendaItem = {
  id: string;
  order: number;
  title: string;
  durationMinutes?: number;
  notes?: string;
};

export type MeetingDecision = {
  id: string;
  title: string;
  status: MeetingDecisionStatus;
  owner: string;
  notes?: string;
};

/** UI workspace model for Meeting detail. */
export type MeetingWorkspaceModel = {
  id: string;
  title: string;
  status: MeetingStatus;
  meetingType: MeetingType;
  startsAt: string;
  endsAt: string | null;
  durationMinutes: number;
  meetingDate: string;
  meetingTime: string;
  location: string | null;
  googleMeetLink: string | null;
  projectId: string | null;
  projectName: string | null;
  clientId: string | null;
  clientName: string | null;
  vendorIds: string[];
  vendorNames: string[];
  ownerId: string | null;
  ownerLabel: string | null;
  participants: MeetingParticipant[];
  notes: string;
  internalNotes: string;
  agenda: MeetingAgendaItem[];
  decisions: MeetingDecision[];
};

export function endsAtFromMeeting(meeting: Meeting): string {
  const start = new Date(meeting.starts_at).getTime();
  return new Date(start + meeting.duration_minutes * 60_000).toISOString();
}

export function toMeetingWorkspaceModel(
  meeting: Meeting,
  labels?: {
    projectName?: string | null;
    clientName?: string | null;
    vendorNames?: string[];
    ownerLabel?: string | null;
  },
): MeetingWorkspaceModel {
  return {
    id: meeting.id,
    title: meeting.title,
    status: meeting.status,
    meetingType: meeting.meeting_type,
    startsAt: meeting.starts_at,
    endsAt: endsAtFromMeeting(meeting),
    durationMinutes: meeting.duration_minutes,
    meetingDate: meeting.meeting_date,
    meetingTime: meeting.meeting_time,
    location: meeting.location,
    googleMeetLink: meeting.google_meet_link,
    projectId: meeting.project_id,
    projectName: labels?.projectName ?? null,
    clientId: meeting.client_id,
    clientName: labels?.clientName ?? null,
    vendorIds: meeting.vendor_ids,
    vendorNames: labels?.vendorNames ?? [],
    ownerId: meeting.owner_id,
    ownerLabel: labels?.ownerLabel ?? null,
    participants: meeting.participants,
    notes: meeting.notes ?? "",
    internalNotes: meeting.internal_notes ?? "",
    agenda: [],
    decisions: [],
  };
}
