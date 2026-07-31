"use client";

import {
  WorkspaceHeader,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import type { NotificationWorkspaceModel } from "@/features/notification/lib/notification-types";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type NotificationWorkspaceHeaderProps = {
  workspace: NotificationWorkspaceModel;
};

export function NotificationWorkspaceHeader({
  workspace,
}: NotificationWorkspaceHeaderProps) {
  const unread = workspace.summary.unread;
  const status: WorkspaceHeaderStatus = {
    label: `${unread} unread`,
    tone: unread > 0 ? "warning" : "success",
  };

  return (
    <WorkspaceHeader
      eyebrow={uiZh.notificationWorkspaceEyebrow}
      title={workspace.title}
      status={status}
      lifecycle={workspace.description}
      breadcrumbs={buildWorkspaceBreadcrumbs("notification")}
    />
  );
}
