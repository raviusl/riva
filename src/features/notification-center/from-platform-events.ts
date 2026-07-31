/**
 * Notification Center adapter — maps PlatformEvent → NotificationCenterItem.
 * Does not derive from entities; consumes Event Bus notification channel only.
 */

import type { Notification } from "@/core/notification";
import { notificationEventConsumer } from "@/core/platform-events/consumers";
import type { PlatformEvent } from "@/core/platform-events/types";
import type { NotificationCenterKind } from "@/features/notification-center/kinds";
import { isNotificationCenterKind } from "@/features/notification-center/kinds";

export type NotificationCenterItem = Notification & {
  href: string | null;
  kind: NotificationCenterKind;
};

function mapKind(event: PlatformEvent): NotificationCenterKind {
  const metaKind = event.metadata.kind;
  if (isNotificationCenterKind(metaKind)) return metaKind;

  if (event.entity === "task" && event.name === "assigned") return "task_assigned";
  if (event.entity === "task" && event.name === "due_today") return "task_due_today";
  if (event.entity === "task" && event.name === "overdue") return "task_overdue";
  if (event.entity === "meeting" && event.name === "reminder") {
    return "meeting_reminder";
  }
  if (event.entity === "meeting" && event.name === "updated") {
    return "meeting_updated";
  }
  if (event.entity === "client" && event.name === "created") return "client_created";
  if (event.entity === "vendor") return "vendor_assigned";
  if (event.entity === "project" && event.name === "updated") {
    return "project_updated";
  }
  if (event.entity === "finance") return "invoice";
  if (event.entity === "documents") return "documents";
  if (event.entity === "calendar") return "calendar";
  return "project_updated";
}

function mapType(kind: NotificationCenterKind): Notification["type"] {
  if (kind.startsWith("task_")) return "task";
  if (kind.startsWith("meeting_")) return "meeting";
  if (kind === "invoice") return "finance";
  if (kind === "documents") return "document";
  return "system";
}

function mapRelatedEntityType(
  entity: PlatformEvent["entity"],
): Notification["relatedEntityType"] {
  switch (entity) {
    case "task":
      return "task";
    case "meeting":
      return "meeting";
    case "project":
      return "project";
    case "client":
      return "client";
    case "vendor":
      return "vendor";
    case "finance":
      return "finance";
    case "documents":
      return "document";
    default:
      return "system";
  }
}

export function mapPlatformEventToNotificationItem(
  event: PlatformEvent,
  recipientId: string,
): NotificationCenterItem {
  const kind = mapKind(event);
  const stamp = event.timestamp;
  const priorityMeta = event.metadata.priority;
  const priority =
    priorityMeta === "urgent" ||
    priorityMeta === "high" ||
    priorityMeta === "low" ||
    priorityMeta === "medium"
      ? priorityMeta
      : kind === "task_overdue"
        ? "urgent"
        : kind === "task_due_today" || kind === "task_assigned"
          ? "high"
          : "medium";

  return {
    id: event.id,
    companyId: event.companyId,
    workspaceId: event.workspaceId,
    relatedEntityId: event.entityId.startsWith("future:")
      ? null
      : event.entityId,
    relatedEntityType: mapRelatedEntityType(event.entity),
    recipientId,
    senderId: event.actorId,
    title: event.title,
    message: event.description,
    type: mapType(kind),
    channel: "in_app",
    status: "sent",
    priority,
    scheduledAt: null,
    sentAt: stamp,
    readAt: null,
    metadata: {
      kind,
      href: event.href,
      platformEventId: event.id,
      ...event.metadata,
    },
    createdAt: stamp,
    updatedAt: stamp,
    href: event.href,
    kind,
  };
}

export function consumeNotificationCenterFromEvents(
  events: readonly PlatformEvent[],
  recipientId: string,
): NotificationCenterItem[] {
  return notificationEventConsumer
    .consume(events)
    .map((event) => mapPlatformEventToNotificationItem(event, recipientId));
}
