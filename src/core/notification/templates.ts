/**
 * Notification templates (contracts only — Project 037).
 * Rendering / delivery providers are deferred.
 */

import type {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
} from "@/core/notification/constants";

export const NOTIFICATION_TEMPLATE_KEYS = [
  "task_assigned",
  "task_due",
  "meeting_reminder",
  "invoice_paid",
  "invoice_overdue",
  "document_shared",
  "project_created",
  "client_assigned",
  "vendor_assigned",
] as const;

export type NotificationTemplateKey =
  (typeof NOTIFICATION_TEMPLATE_KEYS)[number];

export type NotificationTemplate = {
  key: NotificationTemplateKey;
  label: string;
  type: NotificationType;
  defaultChannel: NotificationChannel;
  defaultPriority: NotificationPriority;
  titleTemplate: string;
  messageTemplate: string;
};

export const NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  {
    key: "task_assigned",
    label: "任务已分配",
    type: "task",
    defaultChannel: "in_app",
    defaultPriority: "medium",
    titleTemplate: "任务已分配：{{taskTitle}}",
    messageTemplate: "{{actorName}} 将「{{taskTitle}}」分配给你。",
  },
  {
    key: "task_due",
    label: "任务到期",
    type: "task",
    defaultChannel: "in_app",
    defaultPriority: "high",
    titleTemplate: "任务到期：{{taskTitle}}",
    messageTemplate: "「{{taskTitle}}」将于 {{dueDate}} 到期。",
  },
  {
    key: "meeting_reminder",
    label: "会议提醒",
    type: "meeting",
    defaultChannel: "in_app",
    defaultPriority: "high",
    titleTemplate: "会议提醒：{{meetingTitle}}",
    messageTemplate: "「{{meetingTitle}}」将于 {{startsAt}} 开始。",
  },
  {
    key: "invoice_paid",
    label: "发票已付款",
    type: "finance",
    defaultChannel: "in_app",
    defaultPriority: "medium",
    titleTemplate: "发票已付款：{{invoiceNumber}}",
    messageTemplate: "{{invoiceNumber}} 已标记为已付款。",
  },
  {
    key: "invoice_overdue",
    label: "发票已逾期",
    type: "finance",
    defaultChannel: "email",
    defaultPriority: "urgent",
    titleTemplate: "发票已逾期：{{invoiceNumber}}",
    messageTemplate: "{{invoiceNumber}} 自 {{dueAt}} 起已逾期。",
  },
  {
    key: "document_shared",
    label: "文档已共享",
    type: "document",
    defaultChannel: "in_app",
    defaultPriority: "medium",
    titleTemplate: "文档已共享：{{documentName}}",
    messageTemplate: "{{actorName}} 与你共享了「{{documentName}}」。",
  },
  {
    key: "project_created",
    label: "项目已创建",
    type: "project",
    defaultChannel: "in_app",
    defaultPriority: "low",
    titleTemplate: "项目已创建：{{projectName}}",
    messageTemplate: "{{actorName}} 创建了项目「{{projectName}}」。",
  },
  {
    key: "client_assigned",
    label: "客户已分配",
    type: "client",
    defaultChannel: "in_app",
    defaultPriority: "medium",
    titleTemplate: "客户已分配：{{clientName}}",
    messageTemplate: "你已被分配到客户「{{clientName}}」。",
  },
  {
    key: "vendor_assigned",
    label: "供应商已分配",
    type: "vendor",
    defaultChannel: "in_app",
    defaultPriority: "medium",
    titleTemplate: "供应商已分配：{{vendorName}}",
    messageTemplate: "你已被分配到供应商「{{vendorName}}」。",
  },
] as const;

export function getNotificationTemplate(
  key: NotificationTemplateKey,
): NotificationTemplate | undefined {
  return NOTIFICATION_TEMPLATES.find((template) => template.key === key);
}
