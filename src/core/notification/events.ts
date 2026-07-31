/**
 * Notification domain events (placeholder).
 * Prefer Platform Event Bus (`@/core/platform-events`) + notification channel.
 */

export const NOTIFICATION_EVENTS = [
  "notification_created",
  "notification_sent",
  "notification_read",
  "notification_failed",
  "notification_deleted",
] as const;

export type NotificationEventName = (typeof NOTIFICATION_EVENTS)[number];

export type NotificationDomainEvent = {
  name: NotificationEventName;
  notificationId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
