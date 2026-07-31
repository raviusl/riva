"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { NotificationWorkspaceActivityPanel } from "@/features/notification/components/notification-workspace-activity-panel";
import { NotificationWorkspaceHeader } from "@/features/notification/components/notification-workspace-header";
import { NotificationWorkspaceInboxPanel } from "@/features/notification/components/notification-workspace-inbox-panel";
import { NotificationWorkspaceOverview } from "@/features/notification/components/notification-workspace-overview";
import { NotificationWorkspaceScheduledPanel } from "@/features/notification/components/notification-workspace-scheduled-panel";
import { NotificationWorkspaceTemplatesPanel } from "@/features/notification/components/notification-workspace-templates-panel";
import type { NotificationWorkspaceModel } from "@/features/notification/lib/notification-types";
import {
  DEFAULT_NOTIFICATION_WORKSPACE_TAB,
  NOTIFICATION_WORKSPACE_TABS,
  buildNotificationWorkspaceTabHref,
  parseNotificationWorkspaceTab,
  type NotificationWorkspaceTabId,
} from "@/features/notification/lib/notification-workspace-tabs";

type NotificationWorkspaceProps = {
  model: NotificationWorkspaceModel;
  initialTab?: NotificationWorkspaceTabId;
};

export function NotificationWorkspace({
  model,
  initialTab = DEFAULT_NOTIFICATION_WORKSPACE_TAB,
}: NotificationWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseNotificationWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseNotificationWorkspaceTab(tabId);
      return buildNotificationWorkspaceTabHref(model.id, tab, {
        explicitOverview: true,
      });
    },
    [model.id],
  );

  return (
    <div className="space-y-6">
      <NotificationWorkspaceHeader workspace={model} />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={NOTIFICATION_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <NotificationWorkspaceOverview workspace={model} />
        ) : null}

        {activeTab === "inbox" ? (
          <NotificationWorkspaceInboxPanel
            notifications={model.notifications}
          />
        ) : null}

        {activeTab === "scheduled" ? (
          <NotificationWorkspaceScheduledPanel
            notifications={model.notifications}
          />
        ) : null}

        {activeTab === "templates" ? (
          <NotificationWorkspaceTemplatesPanel templates={model.templates} />
        ) : null}

        {activeTab === "activity" ? (
          <NotificationWorkspaceActivityPanel activities={model.activities} />
        ) : null}
      </div>
    </div>
  );
}
