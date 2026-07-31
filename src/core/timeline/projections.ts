/**
 * Shared timeline milestone projection — engines consume this, not each other.
 */

export const TIMELINE_MILESTONE_STATUSES = [
  "pending",
  "active",
  "completed",
  "skipped",
] as const;

export type TimelineMilestoneStatus =
  (typeof TIMELINE_MILESTONE_STATUSES)[number];

/**
 * Neutral milestone projection for Event Bus / Calendar / Activity.
 * Built by Timeline Engine adapters; never imported engine-to-engine.
 */
export type TimelineMilestoneProjection = {
  id: string;
  projectId: string;
  projectName: string;
  companyId: string;
  workspaceId: string;
  title: string;
  description: string | null;
  date: string | null;
  status: TimelineMilestoneStatus;
  ownerId: string | null;
  ownerName: string | null;
  sequence: number;
};
