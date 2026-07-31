/**
 * Activity Feed adapter — maps PlatformEvent → ActivityFeedItem.
 * Does not derive from entities; consumes Event Bus channel only.
 */

import { activityEventConsumer } from "@/core/platform-events/consumers";
import type { PlatformEvent } from "@/core/platform-events/types";
import type { ActivityEntity, ActivityType } from "@/features/activity-feed/kinds";
import {
  filterMatchesEntity,
  type ActivityFilter,
} from "@/features/activity-feed/kinds";
import type { ActivityFeedItem } from "@/features/activity-feed/types";

function mapName(name: PlatformEvent["name"]): ActivityType {
  switch (name) {
    case "created":
      return "created";
    case "updated":
      return "updated";
    case "assigned":
      return "assigned";
    case "completed":
    case "milestone_completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "scheduled":
      return "scheduled";
    case "status_changed":
    case "milestone_active":
      return "status_changed";
    case "reminder":
      return "reminder";
    case "published":
      return "published";
    case "placeholder":
      return "placeholder";
    case "due_today":
    case "overdue":
      return "reminder";
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}

function mapEntity(entity: PlatformEvent["entity"]): ActivityEntity {
  switch (entity) {
    case "project":
    case "client":
    case "vendor":
    case "meeting":
    case "task":
    case "timeline":
    case "notification":
    case "finance":
    case "documents":
    case "calendar":
      return entity;
    default:
      return "notification";
  }
}

export function mapPlatformEventToActivityItem(
  event: PlatformEvent,
): ActivityFeedItem {
  return {
    id: event.id,
    type: mapName(event.name),
    entity: mapEntity(event.entity),
    entityId: event.entityId,
    title: event.title,
    description: event.description,
    userId: event.actorId,
    userLabel: event.actorLabel,
    companyId: event.companyId,
    workspaceId: event.workspaceId,
    timestamp: event.timestamp,
    href: event.href,
  };
}

export function consumeActivityFeedFromEvents(
  events: readonly PlatformEvent[],
  options?: { filter?: ActivityFilter; limit?: number },
): ActivityFeedItem[] {
  const channelEvents = activityEventConsumer.consume(events);
  let items = channelEvents.map(mapPlatformEventToActivityItem);
  if (options?.filter) {
    items = items.filter((item) =>
      filterMatchesEntity(options.filter!, item.entity),
    );
  }
  if (typeof options?.limit === "number" && options.limit >= 0) {
    items = items.slice(0, options.limit);
  }
  return items;
}
