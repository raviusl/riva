/**
 * Notification domain constants (types, channels, statuses, priorities).
 */

export const NOTIFICATION_TYPES = [
  "system",
  "task",
  "meeting",
  "finance",
  "document",
  "project",
  "client",
  "vendor",
  "reminder",
  "announcement",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_CHANNELS = [
  "in_app",
  "email",
  "sms",
  "whatsapp",
  "push",
] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_STATUSES = [
  "pending",
  "queued",
  "sent",
  "delivered",
  "read",
  "failed",
  "dismissed",
] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_RELATED_ENTITY_TYPES = [
  "system",
  "task",
  "meeting",
  "finance",
  "document",
  "project",
  "client",
  "vendor",
  "reminder",
  "announcement",
] as const;
export type NotificationRelatedEntityType =
  (typeof NOTIFICATION_RELATED_ENTITY_TYPES)[number];
