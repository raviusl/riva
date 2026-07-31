import type { Notification, NotificationChannel } from "@/core/notification";
import type { NotificationTemplate } from "@/core/notification";

export type NotificationWorkspaceItem = Notification & {
  recipientLabel: string | null;
  senderLabel: string | null;
};

export type NotificationChannelSummary = {
  channel: NotificationChannel;
  count: number;
};

export type NotificationActivityItem = {
  id: string;
  actorLabel: string | null;
  message: string;
  createdAt: string;
};

export type NotificationWorkspaceSummary = {
  total: number;
  unread: number;
  scheduled: number;
  failed: number;
  channelSummary: NotificationChannelSummary[];
};

/** Hub model for the Notification Workspace (preview until persistence). */
export type NotificationWorkspaceModel = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  workspaceId: string;
  summary: NotificationWorkspaceSummary;
  notifications: NotificationWorkspaceItem[];
  templates: readonly NotificationTemplate[];
  activities: NotificationActivityItem[];
};
