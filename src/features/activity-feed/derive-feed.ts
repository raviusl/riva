/**
 * Activity Feed derive — thin consumer over Platform Event Bus (Project 088).
 * Entity derivation lives in `@/core/platform-events`; this file only maps.
 */

import {
  derivePlatformEvents,
  type DerivePlatformEventsInput,
} from "@/core/platform-events";
import type { TimelineMilestoneProjection } from "@/core/timeline/projections";
import type { ActivityFilter } from "@/features/activity-feed/kinds";
import { consumeActivityFeedFromEvents } from "@/features/activity-feed/from-platform-events";
import type { ActivityFeedItem } from "@/features/activity-feed/types";

export type DeriveActivityFeedInput = DerivePlatformEventsInput & {
  filter?: ActivityFilter;
  limit?: number;
  /** @deprecated Use `milestones` projections — kept for call-site compatibility. */
  timelineLocalByProject?: unknown;
  /** @deprecated Notifications now derive from the shared Event Bus. */
  notifications?: unknown;
};

export function deriveActivityFeed(
  input: DeriveActivityFeedInput,
): ActivityFeedItem[] {
  const {
    filter,
    limit,
    timelineLocalByProject: _timelineLocal,
    notifications: _notifications,
    ...platformInput
  } = input;

  const events = derivePlatformEvents(platformInput);
  return consumeActivityFeedFromEvents(events, { filter, limit });
}

/** Map feed items to the compact dashboard ActivityItem shape. */
export function toWorkspaceActivityItems(
  items: readonly ActivityFeedItem[],
): { id: string; title: string; meta?: string; href?: string }[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    meta: new Date(item.timestamp).toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    href: item.href ?? undefined,
  }));
}

export type { TimelineMilestoneProjection };
