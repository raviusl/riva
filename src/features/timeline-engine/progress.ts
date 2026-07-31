/**
 * Overall project timeline progress.
 * Progress = completed / total (skipped counts in total, not completed).
 */

import type { TimelineMilestoneItem } from "@/features/timeline-engine/types";
import type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";

export function calculateTimelineProgress(
  milestones: readonly Pick<TimelineMilestoneItem, "status">[],
): {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
} {
  const totalCount = milestones.length;
  const completedCount = milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return { completedCount, totalCount, progressPercent };
}

export function isTerminalMilestoneStatus(
  status: TimelineMilestoneStatus,
): boolean {
  return status === "completed" || status === "skipped";
}
