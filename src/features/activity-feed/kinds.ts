/**
 * Activity Feed Engine entity / filter catalogs (Project 079).
 */

export const ACTIVITY_ENTITIES = [
  "project",
  "client",
  "vendor",
  "meeting",
  "task",
  "timeline",
  "notification",
  // Future-ready
  "finance",
  "documents",
  "calendar",
] as const;

export type ActivityEntity = (typeof ACTIVITY_ENTITIES)[number];

export const ACTIVITY_FILTERS = [
  "all",
  "projects",
  "clients",
  "meetings",
  "tasks",
  "timeline",
  "notifications",
] as const;

export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

export const ACTIVITY_TYPES = [
  "created",
  "updated",
  "assigned",
  "completed",
  "cancelled",
  "scheduled",
  "status_changed",
  "reminder",
  "published",
  "placeholder",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TIME_GROUPS = ["today", "yesterday", "earlier"] as const;

export type ActivityTimeGroup = (typeof ACTIVITY_TIME_GROUPS)[number];

export function filterMatchesEntity(
  filter: ActivityFilter,
  entity: ActivityEntity,
): boolean {
  if (filter === "all") return true;
  if (filter === "projects") return entity === "project";
  if (filter === "clients") return entity === "client";
  if (filter === "meetings") return entity === "meeting";
  if (filter === "tasks") return entity === "task";
  if (filter === "timeline") return entity === "timeline";
  if (filter === "notifications") return entity === "notification";
  return true;
}
