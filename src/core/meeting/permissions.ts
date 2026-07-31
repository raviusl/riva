export const MEETING_PERMISSIONS = [
  "meeting.read",
  "meeting.write",
] as const;

export type MeetingPermission = (typeof MEETING_PERMISSIONS)[number];
