import { uiZh } from "@/config/ui-zh";
import type { ProjectStatus } from "@/core/types";

/** Statuses available when creating a project (excludes archived). */
export const PROJECT_FOUNDATION_STATUSES = [
  "inquiry",
  "proposal",
  "confirmed",
  "planning",
  "execution",
  "completed",
  "cancelled",
] as const satisfies readonly ProjectStatus[];

export function formatProjectStatus(status: string): string {
  switch (status) {
    case "inquiry":
      return uiZh.weddingStatusInquiry;
    case "proposal":
      return "Proposal";
    case "confirmed":
      return uiZh.confirmed;
    case "planning":
      return uiZh.planning;
    case "execution":
    case "active":
      return uiZh.projectActive;
    case "completed":
      return uiZh.completed;
    case "cancelled":
      return uiZh.cancelled;
    case "archived":
      return uiZh.archived;
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
