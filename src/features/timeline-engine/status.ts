/**
 * Timeline Engine milestone statuses.
 */

export const TIMELINE_MILESTONE_STATUSES = [
  "pending",
  "active",
  "completed",
  "skipped",
] as const;

export type TimelineMilestoneStatus =
  (typeof TIMELINE_MILESTONE_STATUSES)[number];
