import { redirect } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { requireDashboardContext } from "@/core/auth/context";
import { NotificationWorkspace } from "@/features/notification/components/notification-workspace";
import { getNotificationWorkspacePreview } from "@/features/notification/lib/notification-workspace-preview";
import {
  NOTIFICATION_WORKSPACE_HUB_ID,
  buildNotificationWorkspaceTabHref,
  parseNotificationWorkspaceTab,
} from "@/features/notification/lib/notification-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function NotificationWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireDashboardContext();

  const hubId = id.trim() || NOTIFICATION_WORKSPACE_HUB_ID;
  const initialTab = parseNotificationWorkspaceTab(query.tab);

  if (hubId !== NOTIFICATION_WORKSPACE_HUB_ID) {
    redirect(
      buildNotificationWorkspaceTabHref(
        NOTIFICATION_WORKSPACE_HUB_ID,
        initialTab,
        { explicitOverview: true },
      ),
    );
  }

  const model = getNotificationWorkspacePreview(NOTIFICATION_WORKSPACE_HUB_ID);

  return (
    <WorkspaceLayout
      backHref="/dashboard/notifications"
      backLabel="← Notifications"
    >
      <NotificationWorkspace model={model} initialTab={initialTab} />
    </WorkspaceLayout>
  );
}
