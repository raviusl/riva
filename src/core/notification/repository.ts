import type {
  CreateNotificationInput,
  DeleteNotificationInput,
  ListNotificationsQuery,
  MarkAllNotificationsReadInput,
  MarkNotificationReadInput,
  UpdateNotificationInput,
} from "@/core/notification/schema";
import type { Notification, NotificationId } from "@/core/notification/types";

/**
 * Notification persistence contract — implementation deferred.
 * No delivery providers in Project 037.
 */
export interface NotificationRepository {
  findById(notificationId: NotificationId): Promise<Notification | null>;
  list(query: ListNotificationsQuery): Promise<Notification[]>;
  listByRecipient(
    companyId: string,
    workspaceId: string,
    recipientId: string,
  ): Promise<Notification[]>;
  listUnread(
    companyId: string,
    workspaceId: string,
    recipientId: string,
  ): Promise<Notification[]>;
  create(input: CreateNotificationInput): Promise<Notification>;
  update(input: UpdateNotificationInput): Promise<Notification>;
  delete(input: DeleteNotificationInput): Promise<void>;
  markAsRead(input: MarkNotificationReadInput): Promise<Notification>;
  markAllAsRead(input: MarkAllNotificationsReadInput): Promise<number>;
}
