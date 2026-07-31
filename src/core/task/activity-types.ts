/**
 * Task activity types (Project 031).
 */

export const TASK_ACTIVITY_TYPES = [
  "task_created",
  "task_updated",
  "status_changed",
  "priority_changed",
  "assignee_changed",
  "owner_changed",
  "due_date_changed",
  "task_deleted",
] as const;

export type TaskActivityType = (typeof TASK_ACTIVITY_TYPES)[number];

export type TaskActivityId = string;

export type TaskActivity = {
  id: TaskActivityId;
  taskId: string | null;
  workspaceId: string;
  companyId: string;
  actorId: string;
  activityType: TaskActivityType;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreateTaskActivityInput = {
  taskId: string | null;
  workspaceId: string;
  companyId: string;
  actorId: string;
  activityType: TaskActivityType;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ListTaskActivitiesQuery = {
  workspaceId: string;
  companyId: string;
  taskId?: string;
  limit?: number;
};
