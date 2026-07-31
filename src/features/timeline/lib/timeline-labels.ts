import type { TimelineFeedKind } from "@/core/timeline";
import { uiZh } from "@/config/ui-zh";

export function formatTimelineDateTime(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("zh-CN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return new Date(value).toLocaleString("zh-CN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timelineKindIcon(kind: TimelineFeedKind): string {
  switch (kind) {
    case "meeting":
      return "M";
    case "task":
      return "T";
    case "task_activity":
      return "A";
    case "future_event":
      return "E";
    default:
      return "·";
  }
}

export function timelineStatusLabel(status: string | null): string {
  if (!status) return uiZh.emDash;
  if (status === "in_progress") return uiZh.inProgress;
  if (status === "todo") return uiZh.todo;
  if (status === "waiting") return uiZh.waiting;
  if (status === "completed") return uiZh.completed;
  if (status === "cancelled") return uiZh.cancelled;
  if (status === "scheduled") return uiZh.scheduled;
  if (status === "confirmed") return uiZh.confirmed;
  if (status.includes("_")) {
    return status.split("_").join(" ");
  }
  return status;
}
