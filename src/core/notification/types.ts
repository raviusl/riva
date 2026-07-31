/**
 * Shared Notification domain types — platform foundation (Project 037).
 */

import type {
  NotificationChannel,
  NotificationPriority,
  NotificationRelatedEntityType,
  NotificationStatus,
  NotificationType,
} from "@/core/notification/constants";

export type {
  NotificationChannel,
  NotificationPriority,
  NotificationRelatedEntityType,
  NotificationStatus,
  NotificationType,
} from "@/core/notification/constants";

export type NotificationId = string;

export type NotificationMetadata = Readonly<Record<string, unknown>>;

/**
 * Core Notification entity shared across the platform.
 * Delivery providers (email / SMS / push / websocket) are deferred.
 */
export type Notification = {
  id: NotificationId;
  companyId: string;
  workspaceId: string;
  relatedEntityId: string | null;
  relatedEntityType: NotificationRelatedEntityType | null;
  recipientId: string;
  senderId: string | null;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  priority: NotificationPriority;
  scheduledAt: string | null;
  sentAt: string | null;
  readAt: string | null;
  metadata: NotificationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type NotificationModel = Notification;
