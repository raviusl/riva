/**
 * Activity-shaped publish wrapper — delegates to Platform Event Bus publisher.
 */

import { publishPlatformEvent } from "@/core/platform-events/publish";
import type { ActivityEntity, ActivityType } from "@/features/activity-feed/kinds";
import type { ActivityFeedItem } from "@/features/activity-feed/types";
import { mapPlatformEventToActivityItem } from "@/features/activity-feed/from-platform-events";

export type PublishActivityInput = {
  companyId: string;
  workspaceId: string;
  type: ActivityType;
  entity: ActivityEntity;
  entityId: string;
  title: string;
  description: string;
  timestamp: string;
  userId?: string | null;
  userLabel?: string | null;
  href?: string | null;
  salt?: string;
};

function mapType(type: ActivityType) {
  switch (type) {
    case "created":
    case "updated":
    case "assigned":
    case "completed":
    case "cancelled":
    case "scheduled":
    case "status_changed":
    case "reminder":
    case "published":
    case "placeholder":
      return type;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

/**
 * Publish one activity via the shared Platform Event publisher.
 */
export function publishActivity(input: PublishActivityInput): ActivityFeedItem {
  const event = publishPlatformEvent({
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    name: mapType(input.type),
    entity: input.entity,
    entityId: input.entityId,
    title: input.title,
    description: input.description,
    timestamp: input.timestamp,
    actorId: input.userId,
    actorLabel: input.userLabel,
    href: input.href,
    channels: ["activity", "audit", "workflow"],
    salt: input.salt,
  });
  return mapPlatformEventToActivityItem(event);
}
