/**
 * Activity Feed Engine (Project 079).
 * Unified platform event stream — modules publish, consumers reuse.
 */

export type {
  ActivityEntity,
  ActivityFilter,
  ActivityTimeGroup,
  ActivityType,
} from "@/features/activity-feed/kinds";
export {
  ACTIVITY_ENTITIES,
  ACTIVITY_FILTERS,
  ACTIVITY_TIME_GROUPS,
  ACTIVITY_TYPES,
  filterMatchesEntity,
} from "@/features/activity-feed/kinds";

export type {
  ActivityFeedGroup,
  ActivityFeedItem,
} from "@/features/activity-feed/types";

export {
  publishActivity,
  type PublishActivityInput,
} from "@/features/activity-feed/publish";

export {
  deriveActivityFeed,
  toWorkspaceActivityItems,
  type DeriveActivityFeedInput,
} from "@/features/activity-feed/derive-feed";

export {
  consumeActivityFeedFromEvents,
  mapPlatformEventToActivityItem,
} from "@/features/activity-feed/from-platform-events";

export {
  consumeAiDailyBriefFromEvents,
  resolveAiDailyBriefMessage,
} from "@/features/activity-feed/ai-brief";

export {
  groupActivityFeed,
  resolveActivityTimeGroup,
} from "@/features/activity-feed/group-feed";

export {
  formatActivityEntity,
  formatActivityFilter,
  formatActivityType,
} from "@/features/activity-feed/labels";

export { ActivityFeedPanel } from "@/features/activity-feed/activity-feed-panel";
