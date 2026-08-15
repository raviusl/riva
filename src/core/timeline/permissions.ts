export const TIMELINE_PERMISSIONS = [
  "timeline.read",
  "timeline.structure.write",
  "timeline.execute",
  "timeline.comment",
  "timeline.archive",
  "timeline.restore",
  "timeline.state.change",
] as const;

export type TimelinePermission = (typeof TIMELINE_PERMISSIONS)[number];
