import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { NOTIFICATION_WORKSPACE_HUB_ID } from "@/features/notification/lib/notification-workspace-tabs";
import { buildNotificationWorkspaceTabHref } from "@/features/notification/lib/notification-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export default async function NotificationsPage() {
  await requireDashboardContext();

  const workspaceHref = buildWorkspaceOverviewHref(
    "notification",
    NOTIFICATION_WORKSPACE_HUB_ID,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.notificationsPageTitle}</h1>
          <p className="mt-2 text-sm text-white/45">
            {uiZh.notificationsPageDesc}
          </p>
        </div>
        <Link
          href={workspaceHref}
          className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {uiZh.openWorkspace}
        </Link>
      </div>

      <ModuleEmptyState
        title={uiZh.notificationWorkspaceTitle}
        description={uiZh.notificationWorkspaceEmptyDesc}
        actionHref={workspaceHref}
        actionLabel={uiZh.openNotificationWorkspaceBtn}
      />

      <p className="text-center text-xs text-white/35">
        {uiZh.orOpen}{" "}
        <Link
          href={buildNotificationWorkspaceTabHref(
            NOTIFICATION_WORKSPACE_HUB_ID,
            "inbox",
          )}
          className="text-white/55 hover:text-white/80"
        >
          /dashboard/notifications/workspace?tab=inbox
        </Link>
      </p>
    </div>
  );
}
