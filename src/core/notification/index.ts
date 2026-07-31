/**
 * Notification domain foundation — contracts + validation (Project 037).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 *
 * No UI · No Workspace · No email/SMS/push providers · No websocket.
 */

export type {
  Notification,
  NotificationChannel,
  NotificationId,
  NotificationMetadata,
  NotificationModel,
  NotificationPriority,
  NotificationRelatedEntityType,
  NotificationStatus,
  NotificationType,
} from "@/core/notification/types";

export {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_RELATED_ENTITY_TYPES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
} from "@/core/notification/constants";

export type {
  CreateNotificationInput,
  DeleteNotificationInput,
  ListNotificationsQuery,
  MarkAllNotificationsReadInput,
  MarkNotificationReadInput,
  NotificationIdInput,
  QueueNotificationInput,
  ScheduleNotificationInput,
  UpdateNotificationInput,
} from "@/core/notification/schema";

export {
  createNotificationSchema,
  deleteNotificationSchema,
  listNotificationsQuerySchema,
  markAllNotificationsReadSchema,
  markNotificationReadSchema,
  notificationChannelSchema,
  notificationIdSchema,
  notificationPrioritySchema,
  notificationRelatedEntityTypeSchema,
  notificationSchema,
  notificationStatusSchema,
  notificationTypeSchema,
  queueNotificationSchema,
  scheduleNotificationSchema,
  updateNotificationSchema,
} from "@/core/notification/schema";

export type { NotificationRepository } from "@/core/notification/repository";

export type { NotificationService } from "@/core/notification/service";
export {
  markAllRead,
  markRead,
  queueNotification,
  scheduleNotification,
  validateCreateNotification,
  validateDeleteNotification,
  validateListNotificationsQuery,
  validateNotificationId,
  validateUpdateNotification,
} from "@/core/notification/service";

export type { NotificationPermission } from "@/core/notification/permissions";
export { NOTIFICATION_PERMISSIONS } from "@/core/notification/permissions";

export type {
  NotificationDomainEvent,
  NotificationEventName,
} from "@/core/notification/events";
export { NOTIFICATION_EVENTS } from "@/core/notification/events";

export type {
  NotificationTemplate,
  NotificationTemplateKey,
} from "@/core/notification/templates";
export {
  NOTIFICATION_TEMPLATES,
  NOTIFICATION_TEMPLATE_KEYS,
  getNotificationTemplate,
} from "@/core/notification/templates";
