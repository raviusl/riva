/**
 * Project Timeline Engine (Project 077).
 * One project → one ordered lifecycle timeline.
 */

export type {
  DefaultMilestoneKind,
  MilestoneKind,
} from "@/features/timeline-engine/defaults";
export { DEFAULT_MILESTONE_KINDS } from "@/features/timeline-engine/defaults";

export type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";
export { TIMELINE_MILESTONE_STATUSES } from "@/features/timeline-engine/status";

export type {
  ProjectTimelineEngine,
  TimelineMilestoneItem,
  TimelineRelatedMeeting,
  TimelineRelatedTask,
} from "@/features/timeline-engine/types";

export {
  buildProjectTimeline,
  type BuildProjectTimelineInput,
} from "@/features/timeline-engine/build-timeline";

export {
  calculateTimelineProgress,
  isTerminalMilestoneStatus,
} from "@/features/timeline-engine/progress";

export { ProjectTimelineEnginePanel } from "@/features/timeline-engine/timeline-engine-panel";

export {
  formatMilestoneStatus,
  defaultMilestoneTitle,
  defaultMilestoneDescription,
} from "@/features/timeline-engine/labels";

export { toTimelineMilestoneProjections } from "@/features/timeline-engine/to-projections";
export { buildCompanyMilestoneProjections } from "@/features/timeline-engine/build-projections";
