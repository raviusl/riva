import { requireDashboardContext } from "@/core/auth/context";
import { uiZh } from "@/config/ui-zh";
import { ActivityFeedPanel } from "@/features/activity-feed";
import { brandPageClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

export default async function ActivityFeedPage() {
  const context = await requireDashboardContext();

  const canRead =
    context.permissions.has("project.read") ||
    context.permissions.has("client.read") ||
    context.permissions.has("vendor.read") ||
    context.permissions.has("meeting.read") ||
    context.permissions.has("task.read") ||
    context.permissions.has("timeline.read") ||
    context.permissions.has("notification.read");

  if (!canRead) {
    return (
      <div
        className={cn(
          brandPageClassName,
          "max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55",
        )}
      >
        {uiZh.noPermissionActivity}
      </div>
    );
  }

  return (
    <div className={cn(brandPageClassName, "max-w-3xl")}>
      <ActivityFeedPanel
        workspaceId={context.workspace.id}
        companyId={context.company.id}
      />
    </div>
  );
}
