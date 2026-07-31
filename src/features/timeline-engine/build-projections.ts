/**
 * Orchestrator helper — builds milestone projections without engines importing each other.
 * Used by server actions / panels that already load projects.
 */

import type { Meeting } from "@/core/meeting/types";
import type { Task } from "@/core/task/types";
import type { TimelineMilestoneProjection } from "@/core/timeline/projections";
import type { Project } from "@/core/types";
import { buildProjectTimeline } from "@/features/timeline-engine/build-timeline";
import type { ProjectTimelineLocalState } from "@/features/timeline-engine/local-state";
import { toTimelineMilestoneProjections } from "@/features/timeline-engine/to-projections";

export function buildCompanyMilestoneProjections(input: {
  projects: readonly Project[];
  tasks?: readonly Task[];
  meetings?: readonly Meeting[];
  timelineLocalByProject?: ReadonlyMap<string, ProjectTimelineLocalState>;
}): TimelineMilestoneProjection[] {
  const { projects, tasks = [], meetings = [], timelineLocalByProject } = input;
  const projections: TimelineMilestoneProjection[] = [];

  for (const project of projects) {
    const timeline = buildProjectTimeline({
      project,
      tasks,
      meetings,
      local: timelineLocalByProject?.get(project.id),
    });
    projections.push(
      ...toTimelineMilestoneProjections(timeline, project.name),
    );
  }

  return projections;
}
