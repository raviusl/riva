import { uiZh } from "@/config/ui-zh";
import type { ProjectStatus } from "@/core/types";

export const PROJECT_FOUNDATION_STATUSES = [
  "planning",
  "active",
  "completed",
  "archived",
] as const satisfies readonly ProjectStatus[];

export function formatProjectStatus(status: string): string {
  switch (status) {
    case "planning":
      return uiZh.planning;
    case "active":
      return uiZh.projectActive;
    case "completed":
      return uiZh.completed;
    case "archived":
      return uiZh.archived;
    default:
      return status;
  }
}

export function formatProjectDate(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(`${value}T12:00:00`).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
