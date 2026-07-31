import type {
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from "@/core/notification";
import { uiZh } from "@/config/ui-zh";

export function formatNotificationDateTime(
  value: string | null | undefined,
): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function notificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case "system":
      return uiZh.systemActor;
    case "task":
      return uiZh.taskSingular;
    case "meeting":
      return uiZh.meetingSingular;
    case "finance":
      return uiZh.finance;
    case "document":
      return uiZh.document;
    case "project":
      return uiZh.projectSingular;
    case "client":
      return uiZh.client;
    case "vendor":
      return uiZh.vendorSingular;
    case "reminder":
      return uiZh.reminder;
    case "announcement":
      return uiZh.announcement;
    default:
      return type;
  }
}

export function notificationChannelLabel(channel: NotificationChannel): string {
  switch (channel) {
    case "in_app":
      return uiZh.channelInAppShort;
    case "email":
      return uiZh.email;
    case "sms":
      return uiZh.channelSms;
    case "whatsapp":
      return uiZh.channelWhatsapp;
    case "push":
      return uiZh.channelPush;
  }
}

export function notificationStatusLabel(status: NotificationStatus): string {
  switch (status) {
    case "pending":
      return uiZh.pending;
    case "queued":
      return uiZh.queued;
    case "sent":
      return uiZh.sent;
    case "delivered":
      return uiZh.delivered;
    case "read":
      return uiZh.readStatus;
    case "failed":
      return uiZh.failed;
    case "dismissed":
      return uiZh.dismissed;
    default:
      return status;
  }
}

export function notificationPriorityLabel(
  priority: NotificationPriority,
): string {
  switch (priority) {
    case "low":
      return uiZh.priorityLow;
    case "medium":
      return uiZh.priorityMedium;
    case "high":
      return uiZh.priorityHigh;
    case "urgent":
      return uiZh.priorityUrgent;
    default:
      return priority;
  }
}

export function isUnreadStatus(status: NotificationStatus): boolean {
  return (
    status === "pending" ||
    status === "queued" ||
    status === "sent" ||
    status === "delivered"
  );
}

export function isScheduledStatus(status: NotificationStatus): boolean {
  return status === "pending" || status === "queued";
}
