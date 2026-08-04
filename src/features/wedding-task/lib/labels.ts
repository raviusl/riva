import { uiZh } from "@/config/ui-zh";
import type {
  WeddingTaskPriority,
  WeddingTaskSort,
  WeddingTaskStatus,
} from "@/core/wedding-task/constants";
import type { WeddingProjectTask } from "@/core/wedding-task/types";

export function formatWeddingTaskStatus(
  status: WeddingTaskStatus | string,
): string {
  switch (status) {
    case "todo":
      return uiZh.wtStatusTodo;
    case "in_progress":
      return uiZh.wtStatusInProgress;
    case "waiting":
      return uiZh.wtStatusWaiting;
    case "completed":
      return uiZh.wtStatusCompleted;
    case "cancelled":
      return uiZh.wtStatusCancelled;
    default:
      return status;
  }
}

export function formatWeddingTaskPriority(
  priority: WeddingTaskPriority | string,
): string {
  switch (priority) {
    case "low":
      return uiZh.wtPriorityLow;
    case "normal":
      return uiZh.wtPriorityNormal;
    case "high":
      return uiZh.wtPriorityHigh;
    case "urgent":
      return uiZh.wtPriorityUrgent;
    default:
      return priority;
  }
}

export function formatWeddingTaskSort(sort: WeddingTaskSort): string {
  switch (sort) {
    case "sequence":
      return uiZh.wtSortSequence;
    case "due_date":
      return uiZh.wtSortDueDate;
    case "priority":
      return uiZh.wtSortPriority;
    case "status":
      return uiZh.wtSortStatus;
    case "updated_at":
      return uiZh.wtSortUpdated;
    case "title":
      return uiZh.wtSortTitle;
    default:
      return sort;
  }
}

const PRIORITY_WEIGHT: Record<WeddingTaskPriority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const STATUS_WEIGHT: Record<WeddingTaskStatus, number> = {
  in_progress: 0,
  waiting: 1,
  todo: 2,
  completed: 3,
  cancelled: 4,
};

export function sortWeddingTasks(
  tasks: WeddingProjectTask[],
  sort: WeddingTaskSort,
): WeddingProjectTask[] {
  const rows = [...tasks];
  rows.sort((a, b) => {
    switch (sort) {
      case "due_date": {
        if (!a.due_date && !b.due_date) return a.sequence - b.sequence;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      }
      case "priority":
        return (
          PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
          a.sequence - b.sequence
        );
      case "status":
        return (
          STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status] ||
          a.sequence - b.sequence
        );
      case "updated_at":
        return b.updated_at.localeCompare(a.updated_at);
      case "title":
        return a.title.localeCompare(b.title, "zh");
      case "sequence":
      default:
        return a.sequence - b.sequence;
    }
  });
  return rows;
}

export function weddingTaskProgress(tasks: WeddingProjectTask[]): {
  total: number;
  completed: number;
  percent: number;
  overdue: number;
  dueToday: number;
} {
  const active = tasks.filter((t) => !t.archived_at && t.status !== "cancelled");
  const completed = active.filter((t) => t.status === "completed").length;
  const total = active.length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  let overdue = 0;
  let dueToday = 0;
  for (const task of active) {
    if (task.status === "completed" || !task.due_date) continue;
    if (task.due_date < todayStr) overdue += 1;
    else if (task.due_date === todayStr) dueToday += 1;
  }

  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    overdue,
    dueToday,
  };
}

export function daysUntilDue(dueDate: string | null | undefined): number | null {
  if (!dueDate) return null;
  const target = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

export function statusTone(status: WeddingTaskStatus | string): string {
  switch (status) {
    case "todo":
      return "bg-white/10 text-white/70";
    case "in_progress":
      return "bg-sky-500/20 text-sky-200";
    case "waiting":
      return "bg-amber-500/20 text-amber-200";
    case "completed":
      return "bg-emerald-500/20 text-emerald-200";
    case "cancelled":
      return "bg-rose-500/15 text-rose-200/80";
    default:
      return "bg-white/10 text-white/70";
  }
}

export function priorityTone(priority: WeddingTaskPriority | string): string {
  switch (priority) {
    case "urgent":
      return "text-rose-300";
    case "high":
      return "text-orange-300";
    case "low":
      return "text-white/40";
    default:
      return "text-white/65";
  }
}

export function tasksByDueMonth(
  tasks: WeddingProjectTask[],
  year: number,
  month: number,
): Map<number, WeddingProjectTask[]> {
  const map = new Map<number, WeddingProjectTask[]>();
  for (const task of tasks) {
    if (!task.due_date) continue;
    const [y, m, d] = task.due_date.split("-").map(Number);
    if (y !== year || m !== month + 1) continue;
    const day = d ?? 0;
    const list = map.get(day) ?? [];
    list.push(task);
    map.set(day, list);
  }
  return map;
}
