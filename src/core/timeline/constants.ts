export const TIMELINE_ENTRY_TYPES = [
  "milestone",
  "note",
  "status_change",
] as const;
export type TimelineEntryType = (typeof TIMELINE_ENTRY_TYPES)[number];
