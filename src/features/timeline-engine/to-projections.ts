/**
 * Timeline Engine → neutral Platform Event / Calendar projections.
 * Orchestrators use this; peer engines must not import Timeline Engine UI.
 */

import type { TimelineMilestoneProjection } from "@/core/timeline/projections";
import type { ProjectTimelineEngine } from "@/features/timeline-engine/types";

export function toTimelineMilestoneProjections(
  timeline: ProjectTimelineEngine,
  projectName: string,
): TimelineMilestoneProjection[] {
  return timeline.milestones.map((milestone) => ({
    id: milestone.id,
    projectId: timeline.projectId,
    projectName,
    companyId: timeline.companyId,
    workspaceId: timeline.workspaceId,
    title: milestone.title,
    description: milestone.description,
    date: milestone.date,
    status: milestone.status,
    ownerId: milestone.ownerId,
    ownerName: milestone.ownerName,
    sequence: milestone.sequence,
  }));
}
