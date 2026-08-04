/**
 * Project 100 — Wedding Project Task Management constants.
 */

export const WEDDING_TASK_STATUSES = [
  "todo",
  "in_progress",
  "waiting",
  "completed",
  "cancelled",
] as const;
export type WeddingTaskStatus = (typeof WEDDING_TASK_STATUSES)[number];

export const WEDDING_TASK_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;
export type WeddingTaskPriority = (typeof WEDDING_TASK_PRIORITIES)[number];

export const WEDDING_TASK_REMINDERS = [5, 10, 15, 30, 60, 1440, 2880] as const;

export const WEDDING_TASK_VIEWS = [
  "list",
  "kanban",
  "calendar",
  "progress",
] as const;
export type WeddingTaskView = (typeof WEDDING_TASK_VIEWS)[number];

export const WEDDING_TASK_SORTS = [
  "sequence",
  "due_date",
  "priority",
  "status",
  "updated_at",
  "title",
] as const;
export type WeddingTaskSort = (typeof WEDDING_TASK_SORTS)[number];

export const WEDDING_TASK_KANBAN_COLUMNS: readonly WeddingTaskStatus[] = [
  "todo",
  "in_progress",
  "waiting",
  "completed",
];
