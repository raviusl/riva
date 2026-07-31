export const MEETING_STATUSES = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_TYPES = [
  "consultation",
  "follow_up",
  "venue_visit",
  "vendor_discussion",
  "internal_meeting",
  "wedding_rehearsal",
  "other",
] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const EDITABLE_MEETING_STATUSES: MeetingStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "no_show",
];
