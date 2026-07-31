/**
 * Task domain constants (statuses, priorities) — Project 055.
 */

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "waiting",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const EDITABLE_TASK_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "waiting",
  "completed",
];
