import { z } from "zod";

import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_RELATED_ENTITY_TYPES,
  NOTIFICATION_STATUSES,
  NOTIFICATION_TYPES,
} from "@/core/notification/constants";

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);
export const notificationChannelSchema = z.enum(NOTIFICATION_CHANNELS);
export const notificationStatusSchema = z.enum(NOTIFICATION_STATUSES);
export const notificationPrioritySchema = z.enum(NOTIFICATION_PRIORITIES);
export const notificationRelatedEntityTypeSchema = z.enum(
  NOTIFICATION_RELATED_ENTITY_TYPES,
);

export const notificationIdSchema = z.object({
  notificationId: z.string().uuid(),
});

export type NotificationIdInput = z.infer<typeof notificationIdSchema>;

export const createNotificationSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  relatedEntityId: z.string().uuid().optional().nullable(),
  relatedEntityType: notificationRelatedEntityTypeSchema
    .optional()
    .nullable(),
  recipientId: z.string().uuid(),
  senderId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Notification title is required").max(200),
  message: z.string().min(1, "Notification message is required").max(5000),
  type: notificationTypeSchema,
  channel: notificationChannelSchema.optional().default("in_app"),
  status: notificationStatusSchema.optional().default("pending"),
  priority: notificationPrioritySchema.optional().default("medium"),
  scheduledAt: z.string().min(1).max(64).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const updateNotificationSchema = z.object({
  notificationId: z.string().uuid(),
  relatedEntityId: z.string().uuid().optional().nullable(),
  relatedEntityType: notificationRelatedEntityTypeSchema
    .optional()
    .nullable(),
  title: z.string().min(1).max(200).optional(),
  message: z.string().min(1).max(5000).optional(),
  type: notificationTypeSchema.optional(),
  channel: notificationChannelSchema.optional(),
  status: notificationStatusSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  scheduledAt: z.string().min(1).max(64).optional().nullable(),
  sentAt: z.string().min(1).max(64).optional().nullable(),
  readAt: z.string().min(1).max(64).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;

export const listNotificationsQuerySchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
  type: notificationTypeSchema.optional(),
  channel: notificationChannelSchema.optional(),
  status: notificationStatusSchema.optional(),
  priority: notificationPrioritySchema.optional(),
  relatedEntityType: notificationRelatedEntityTypeSchema.optional(),
  relatedEntityId: z.string().uuid().optional(),
});

export type ListNotificationsQuery = z.infer<
  typeof listNotificationsQuerySchema
>;

export const deleteNotificationSchema = z.object({
  notificationId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteNotificationInput = z.infer<typeof deleteNotificationSchema>;

export const markNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
  recipientId: z.string().uuid(),
  readAt: z.string().min(1).max(64).optional(),
});

export type MarkNotificationReadInput = z.infer<
  typeof markNotificationReadSchema
>;

export const markAllNotificationsReadSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  recipientId: z.string().uuid(),
  readAt: z.string().min(1).max(64).optional(),
});

export type MarkAllNotificationsReadInput = z.infer<
  typeof markAllNotificationsReadSchema
>;

export const queueNotificationSchema = createNotificationSchema.extend({
  status: z.literal("queued").optional().default("queued"),
});

export type QueueNotificationInput = z.infer<typeof queueNotificationSchema>;

export const scheduleNotificationSchema = createNotificationSchema.extend({
  scheduledAt: z.string().min(1).max(64),
  status: z.literal("pending").optional().default("pending"),
});

export type ScheduleNotificationInput = z.infer<
  typeof scheduleNotificationSchema
>;

/** Full Notification shape validation (read model). */
export const notificationSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  relatedEntityId: z.string().uuid().nullable(),
  relatedEntityType: notificationRelatedEntityTypeSchema.nullable(),
  recipientId: z.string().uuid(),
  senderId: z.string().uuid().nullable(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: notificationTypeSchema,
  channel: notificationChannelSchema,
  status: notificationStatusSchema,
  priority: notificationPrioritySchema,
  scheduledAt: z.string().min(1).max(64).nullable(),
  sentAt: z.string().min(1).max(64).nullable(),
  readAt: z.string().min(1).max(64).nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
