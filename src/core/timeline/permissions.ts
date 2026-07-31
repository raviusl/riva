export const TIMELINE_PERMISSIONS = [
  "timeline.read",
  "timeline.write",
] as const;

export type TimelinePermission = (typeof TIMELINE_PERMISSIONS)[number];
