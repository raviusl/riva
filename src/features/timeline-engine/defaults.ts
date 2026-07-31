/**
 * Default project lifecycle milestones (Timeline Engine).
 * Custom milestones may be appended without changing this catalog.
 */

export const DEFAULT_MILESTONE_KINDS = [
  "inquiry",
  "consultation",
  "booking",
  "planning",
  "vendor_confirmation",
  "final_meeting",
  "wedding_day",
  "completion",
] as const;

export type DefaultMilestoneKind = (typeof DEFAULT_MILESTONE_KINDS)[number];

export type MilestoneKind = DefaultMilestoneKind | "custom";
