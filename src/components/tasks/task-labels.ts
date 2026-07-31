import { uiZh } from "@/config/ui-zh";
import type { Task, TaskPriority, TaskStatus } from "@/core/task/types";

/** Foundation priorities (stored values). `normal` displays as Medium. */
export const TASK_FOUNDATION_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const satisfies readonly TaskPriority[];

/** Foundation statuses for create/filter UX (Archived is soft-archive). */
export const TASK_FOUNDATION_STATUSES = [
  "todo",
  "in_progress",
  "completed",
] as const satisfies readonly TaskStatus[];

export function formatTaskPriority(priority: TaskPriority | string): string {
  switch (priority) {
    case "low":
      return uiZh.priorityLow;
    case "normal":
      return uiZh.priorityMedium;
    case "high":
      return uiZh.priorityHigh;
    case "urgent":
      return uiZh.priorityUrgent;
    default:
      return priority;
  }
}

export function formatTaskStatusLabel(status: TaskStatus | string): string {
  switch (status) {
    case "todo":
      return uiZh.todo;
    case "in_progress":
      return uiZh.inProgress;
    case "waiting":
      return uiZh.inProgress;
    case "completed":
      return uiZh.completed;
    case "cancelled":
      return uiZh.archived;
    default:
      return status;
  }
}

/** Display status for foundation list/detail (includes soft-archive). */
export function formatFoundationTaskStatus(task: Task): string {
  if (task.archivedAt || task.status === "cancelled") {
    return uiZh.archived;
  }
  return formatTaskStatusLabel(task.status);
}

export function formatTaskDate(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(`${value}T12:00:00`).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
