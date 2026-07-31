import type { TaskPriority, TaskStatus } from "@/core/task";
import type { WorkspaceHeaderStatus } from "@/components/layout/workspace-header";
import { uiZh } from "@/config/ui-zh";

export function taskStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "in_progress":
      return uiZh.inProgress;
    case "todo":
      return uiZh.todo;
    case "waiting":
      return uiZh.waiting;
    case "completed":
      return uiZh.completed;
    case "cancelled":
      return uiZh.cancelled;
    default:
      return status;
  }
}

export function taskPriorityLabel(priority: TaskPriority): string {
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

export function taskStatusTone(
  status: TaskStatus,
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "todo":
      return "default";
    case "in_progress":
      return "info";
    case "waiting":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "default";
    default:
      return "default";
  }
}

export function formatTaskDate(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
