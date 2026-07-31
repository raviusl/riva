export const MEETING_EVENTS = [
  "meeting.created",
  "meeting.updated",
  "meeting.completed",
  "meeting.cancelled",
  "meeting.deleted",
] as const;

export type MeetingEventName = (typeof MEETING_EVENTS)[number];

export type MeetingDomainEvent = {
  name: MeetingEventName;
  meetingId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
