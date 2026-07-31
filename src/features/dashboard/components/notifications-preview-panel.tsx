import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { NotificationWorkspaceItem } from "@/features/notification/lib/notification-types";
import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { NOTIFICATION_WORKSPACE_HUB_ID } from "@/features/notification/lib/notification-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type NotificationsPreviewPanelProps = {
  notifications: NotificationWorkspaceItem[];
  unreadCount: number;
};

export function NotificationsPreviewPanel({
  notifications,
  unreadCount,
}: NotificationsPreviewPanelProps) {
  const href = buildWorkspaceOverviewHref(
    "notification",
    NOTIFICATION_WORKSPACE_HUB_ID,
  );

  return (
    <DashboardSection
      title={uiZh.notifications}
      description={
        unreadCount > 0
          ? uiZh.unreadPreviewItems(unreadCount)
          : uiZh.inboxPreview
      }
      actionHref={href}
      actionLabel={uiZh.inboxArrow}
    >
      {notifications.length === 0 ? (
        <p className="text-sm text-white/45">{uiZh.noNotificationsPreview}</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/40">
                    {item.message}
                  </p>
                  <p className="mt-1 text-[11px] text-white/30">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                    {!item.readAt ? " · Unread" : ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <Link
          href={href}
          className="text-xs text-white/45 hover:text-white/70"
        >
          Open Notification Workspace →
        </Link>
      </div>
    </DashboardSection>
  );
}
