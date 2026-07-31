/**
 * Timeline domain foundation — contracts + Workspace aggregation (Project 032).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 */

export type {
  TimelineEntry,
  TimelineEntryId,
  TimelineEntryType,
} from "@/core/timeline/types";
export { TIMELINE_ENTRY_TYPES } from "@/core/timeline/constants";

export type {
  CreateTimelineEntryInput,
  ListTimelineEntriesQuery,
  TimelineEntryIdInput,
  UpdateTimelineEntryInput,
} from "@/core/timeline/schema";

export {
  createTimelineEntrySchema,
  listTimelineEntriesQuerySchema,
  timelineEntryIdSchema,
  timelineEntryTypeSchema,
  updateTimelineEntrySchema,
} from "@/core/timeline/schema";

export type { TimelineRepository } from "@/core/timeline/repository";
export type { TimelineService } from "@/core/timeline/service";

export type { TimelinePermission } from "@/core/timeline/permissions";
export { TIMELINE_PERMISSIONS } from "@/core/timeline/permissions";

export type {
  TimelineDomainEvent,
  TimelineEventName,
} from "@/core/timeline/events";
export { TIMELINE_EVENTS } from "@/core/timeline/events";

export type {
  TimelineAggregationQuery,
  TimelineAggregationResult,
  TimelineFeedItem,
  TimelineFeedKind,
} from "@/core/timeline/feed-types";
export { TIMELINE_FEED_KINDS } from "@/core/timeline/feed-types";
export { aggregateTimelineFeed } from "@/core/timeline/aggregate";

export type {
  TimelineMilestoneProjection,
  TimelineMilestoneStatus,
} from "@/core/timeline/projections";
export { TIMELINE_MILESTONE_STATUSES } from "@/core/timeline/projections";
