import {
  createNotificationSchema,
  deleteNotificationSchema,
  listNotificationsQuerySchema,
  markAllNotificationsReadSchema,
  markNotificationReadSchema,
  notificationIdSchema,
  queueNotificationSchema,
  scheduleNotificationSchema,
  updateNotificationSchema,
  type CreateNotificationInput,
  type DeleteNotificationInput,
  type ListNotificationsQuery,
  type MarkAllNotificationsReadInput,
  type MarkNotificationReadInput,
  type NotificationIdInput,
  type QueueNotificationInput,
  type ScheduleNotificationInput,
  type UpdateNotificationInput,
} from "@/core/notification/schema";
import type { Notification } from "@/core/notification/types";

/**
 * Notification domain service contract.
 * Project 037: validation helpers only — no persistence or delivery.
 */
export interface NotificationService {
  getNotification(input: NotificationIdInput): Promise<Notification>;
  listNotifications(query: ListNotificationsQuery): Promise<Notification[]>;
  listNotificationsByRecipient(
    companyId: string,
    workspaceId: string,
    recipientId: string,
  ): Promise<Notification[]>;
  listUnreadNotifications(
    companyId: string,
    workspaceId: string,
    recipientId: string,
  ): Promise<Notification[]>;
  createNotification(input: CreateNotificationInput): Promise<Notification>;
  updateNotification(input: UpdateNotificationInput): Promise<Notification>;
  deleteNotification(input: DeleteNotificationInput): Promise<void>;
  queueNotification(input: QueueNotificationInput): Promise<Notification>;
  scheduleNotification(
    input: ScheduleNotificationInput,
  ): Promise<Notification>;
  markRead(input: MarkNotificationReadInput): Promise<Notification>;
  markAllRead(input: MarkAllNotificationsReadInput): Promise<number>;
}

/** Validate create input. Persistence deferred. */
export function validateCreateNotification(
  input: unknown,
): CreateNotificationInput {
  return createNotificationSchema.parse(input);
}

/** Validate update input. Persistence deferred. */
export function validateUpdateNotification(
  input: unknown,
): UpdateNotificationInput {
  return updateNotificationSchema.parse(input);
}

/** Validate list query. Persistence deferred. */
export function validateListNotificationsQuery(
  input: unknown,
): ListNotificationsQuery {
  return listNotificationsQuerySchema.parse(input);
}

/** Validate notification id input. Persistence deferred. */
export function validateNotificationId(input: unknown): NotificationIdInput {
  return notificationIdSchema.parse(input);
}

/** Validate delete input. Persistence deferred. */
export function validateDeleteNotification(
  input: unknown,
): DeleteNotificationInput {
  return deleteNotificationSchema.parse(input);
}

/**
 * Validate a notification for immediate queueing (status → queued).
 * No provider delivery in Project 037.
 */
export function queueNotification(input: unknown): QueueNotificationInput {
  return queueNotificationSchema.parse(input);
}

/**
 * Validate a notification scheduled for later delivery.
 * No scheduler / provider in Project 037.
 */
export function scheduleNotification(
  input: unknown,
): ScheduleNotificationInput {
  return scheduleNotificationSchema.parse(input);
}

/**
 * Validate mark-as-read input.
 * Persistence deferred.
 */
export function markRead(input: unknown): MarkNotificationReadInput {
  const values = markNotificationReadSchema.parse(input);
  return {
    ...values,
    readAt: values.readAt ?? new Date().toISOString(),
  };
}

/**
 * Validate mark-all-as-read input.
 * Persistence deferred.
 */
export function markAllRead(input: unknown): MarkAllNotificationsReadInput {
  const values = markAllNotificationsReadSchema.parse(input);
  return {
    ...values,
    readAt: values.readAt ?? new Date().toISOString(),
  };
}
