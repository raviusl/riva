import type { Notification } from "@/core/notification";
import { NOTIFICATION_TEMPLATES } from "@/core/notification";
import type {
  NotificationChannelSummary,
  NotificationWorkspaceItem,
  NotificationWorkspaceModel,
  NotificationWorkspaceSummary,
} from "@/features/notification/lib/notification-types";
import {
  isScheduledStatus,
  isUnreadStatus,
} from "@/features/notification/lib/notification-labels";
import { NOTIFICATION_WORKSPACE_HUB_ID } from "@/features/notification/lib/notification-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

const COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "00000000-0000-4000-8000-000000000002";
const RECIPIENT_ALEX = "00000000-0000-4000-8000-0000000000a1";
const RECIPIENT_JORDAN = "00000000-0000-4000-8000-0000000000a2";
const SENDER_SYSTEM = "00000000-0000-4000-8000-0000000000s1";

function daysAgo(days: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function daysFromNow(days: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function withLabels(
  record: Notification,
  names: { recipientLabel?: string | null; senderLabel?: string | null } = {},
): NotificationWorkspaceItem {
  return {
    ...record,
    recipientLabel: names.recipientLabel ?? null,
    senderLabel: names.senderLabel ?? null,
  };
}

function buildSummary(
  items: NotificationWorkspaceItem[],
): NotificationWorkspaceSummary {
  const channelMap = new Map<Notification["channel"], number>();
  let unread = 0;
  let scheduled = 0;
  let failed = 0;

  for (const item of items) {
    channelMap.set(item.channel, (channelMap.get(item.channel) ?? 0) + 1);
    if (isUnreadStatus(item.status) && !item.readAt) unread += 1;
    if (isScheduledStatus(item.status) && item.scheduledAt) scheduled += 1;
    if (item.status === "failed") failed += 1;
  }

  const channelSummary: NotificationChannelSummary[] = [
    ...channelMap.entries(),
  ]
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total: items.length,
    unread,
    scheduled,
    failed,
    channelSummary,
  };
}

/**
 * UI foundation sample Notification Workspace.
 * Delivery providers / websocket / jobs are intentionally out of scope.
 */
export function getNotificationWorkspacePreview(
  hubId: string = NOTIFICATION_WORKSPACE_HUB_ID,
): NotificationWorkspaceModel {
  const base = {
    companyId: COMPANY_ID,
    workspaceId: WORKSPACE_ID,
  } as const;

  const notifications: NotificationWorkspaceItem[] = [
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n1",
        relatedEntityId: "00000000-0000-4000-8000-0000000000t1",
        relatedEntityType: "task",
        recipientId: RECIPIENT_ALEX,
        senderId: RECIPIENT_JORDAN,
        title: "任务已分配：确认花艺",
        message: "Jordan Lee 将「确认花艺」分配给你。",
        type: "task",
        channel: "in_app",
        status: "delivered",
        priority: "medium",
        scheduledAt: null,
        sentAt: daysAgo(0, 2),
        readAt: null,
        metadata: { template: "task_assigned" },
        createdAt: daysAgo(0, 2),
        updatedAt: daysAgo(0, 2),
      },
      { recipientLabel: "Alex Chen", senderLabel: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n2",
        relatedEntityId: "00000000-0000-4000-8000-0000000000m1",
        relatedEntityType: "meeting",
        recipientId: RECIPIENT_ALEX,
        senderId: SENDER_SYSTEM,
        title: "会议提醒：启动评审",
        message: "「启动评审」将于明天 10:00 开始。",
        type: "meeting",
        channel: "email",
        status: "queued",
        priority: "high",
        scheduledAt: daysFromNow(0, 8),
        sentAt: null,
        readAt: null,
        metadata: { template: "meeting_reminder" },
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      },
      { recipientLabel: "Alex Chen", senderLabel: uiZh.systemActor },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n3",
        relatedEntityId: "00000000-0000-4000-8000-0000000000f4",
        relatedEntityType: "finance",
        recipientId: RECIPIENT_JORDAN,
        senderId: SENDER_SYSTEM,
        title: "发票已逾期：INV-298",
        message: "INV-298 自上周起已逾期。",
        type: "finance",
        channel: "email",
        status: "sent",
        priority: "urgent",
        scheduledAt: null,
        sentAt: daysAgo(1, 4),
        readAt: null,
        metadata: { template: "invoice_overdue" },
        createdAt: daysAgo(1, 4),
        updatedAt: daysAgo(1, 4),
      },
      { recipientLabel: "Jordan Lee", senderLabel: uiZh.systemActor },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n4",
        relatedEntityId: "00000000-0000-4000-8000-0000000000d1",
        relatedEntityType: "document",
        recipientId: RECIPIENT_ALEX,
        senderId: RECIPIENT_JORDAN,
        title: "文档已共享：仪式流程单",
        message: "Jordan Lee 与你共享了「仪式流程单」。",
        type: "document",
        channel: "in_app",
        status: "read",
        priority: "medium",
        scheduledAt: null,
        sentAt: daysAgo(3),
        readAt: daysAgo(2),
        metadata: { template: "document_shared" },
        createdAt: daysAgo(3),
        updatedAt: daysAgo(2),
      },
      { recipientLabel: "Alex Chen", senderLabel: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n5",
        relatedEntityId: null,
        relatedEntityType: "announcement",
        recipientId: RECIPIENT_ALEX,
        senderId: SENDER_SYSTEM,
        title: "工作区摘要已就绪",
        message: "你的每周工作区摘要已可查看。",
        type: "announcement",
        channel: "push",
        status: "failed",
        priority: "low",
        scheduledAt: null,
        sentAt: daysAgo(2),
        readAt: null,
        metadata: { error: "push_provider_unavailable" },
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      },
      { recipientLabel: "Alex Chen", senderLabel: uiZh.systemActor },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n6",
        relatedEntityId: "00000000-0000-4000-8000-0000000000t2",
        relatedEntityType: "task",
        recipientId: RECIPIENT_JORDAN,
        senderId: SENDER_SYSTEM,
        title: "任务到期：最终座位图",
        message: "「最终座位图」将在 2 天后到期。",
        type: "reminder",
        channel: "sms",
        status: "pending",
        priority: "high",
        scheduledAt: daysFromNow(1, 9),
        sentAt: null,
        readAt: null,
        metadata: { template: "task_due" },
        createdAt: daysAgo(0, 5),
        updatedAt: daysAgo(0, 5),
      },
      { recipientLabel: "Jordan Lee", senderLabel: uiZh.systemActor },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n7",
        relatedEntityId: "00000000-0000-4000-8000-000000000010",
        relatedEntityType: "project",
        recipientId: RECIPIENT_ALEX,
        senderId: RECIPIENT_JORDAN,
        title: `项目已创建：${uiZh.previewChenWedding}`,
        message: `Jordan Lee 创建了项目「${uiZh.previewChenWedding}」。`,
        type: "project",
        channel: "in_app",
        status: "read",
        priority: "low",
        scheduledAt: null,
        sentAt: daysAgo(10),
        readAt: daysAgo(9),
        metadata: { template: "project_created" },
        createdAt: daysAgo(10),
        updatedAt: daysAgo(9),
      },
      { recipientLabel: "Alex Chen", senderLabel: "Jordan Lee" },
    ),
    withLabels(
      {
        ...base,
        id: "00000000-0000-4000-8000-0000000000n8",
        relatedEntityId: "00000000-0000-4000-8000-0000000000f3",
        relatedEntityType: "finance",
        recipientId: RECIPIENT_ALEX,
        senderId: SENDER_SYSTEM,
        title: "发票已付款：PAY-441",
        message: "已收到付款 PAY-441。",
        type: "finance",
        channel: "whatsapp",
        status: "delivered",
        priority: "medium",
        scheduledAt: null,
        sentAt: daysAgo(4),
        readAt: null,
        metadata: { template: "invoice_paid" },
        createdAt: daysAgo(4),
        updatedAt: daysAgo(4),
      },
      { recipientLabel: "Alex Chen", senderLabel: uiZh.systemActor },
    ),
  ];

  return {
    id: hubId.trim() || NOTIFICATION_WORKSPACE_HUB_ID,
    title: uiZh.notificationWorkspaceTitle,
    description: "收件箱、定时投递与模板（预览）",
    companyId: COMPANY_ID,
    workspaceId: WORKSPACE_ID,
    summary: buildSummary(notifications),
    notifications,
    templates: NOTIFICATION_TEMPLATES,
    activities: [
      {
        id: "act1",
        actorLabel: "Alex Chen",
        message: "收到任务分配通知",
        createdAt: daysAgo(0, 2),
      },
      {
        id: "act2",
        actorLabel: uiZh.systemActor,
        message: "已排队「启动评审」的会议提醒",
        createdAt: daysAgo(1),
      },
      {
        id: "act3",
        actorLabel: uiZh.systemActor,
        message: "推送摘要投递失败",
        createdAt: daysAgo(2),
      },
      {
        id: "act4",
        actorLabel: "Alex Chen",
        message: "将「文档已共享」标记为已读",
        createdAt: daysAgo(2),
      },
      {
        id: "act5",
        actorLabel: uiZh.systemActor,
        message: "已发送 INV-298 逾期邮件",
        createdAt: daysAgo(1, 4),
      },
    ],
  };
}
