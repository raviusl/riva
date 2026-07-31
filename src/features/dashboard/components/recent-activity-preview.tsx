import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import type { TaskActivity } from "@/core/task";
import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { TIMELINE_WORKSPACE_HUB_ID } from "@/features/timeline/lib/timeline-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type RecentActivityPreviewProps = {
  activities: TaskActivity[];
  canRead: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function RecentActivityPreview({
  activities,
  canRead,
}: RecentActivityPreviewProps) {
  const timelineHref = buildWorkspaceOverviewHref(
    "timeline",
    TIMELINE_WORKSPACE_HUB_ID,
  );

  return (
    <DashboardSection
      title={uiZh.recentActivityTitle}
      description={uiZh.latestTaskActivity}
      actionHref={timelineHref}
      actionLabel={uiZh.timelineArrow}
    >
      {!canRead ? (
        <p className="text-sm text-white/45">
          {uiZh.activityRequiresTaskAccess}
        </p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-white/45">{uiZh.noRecentActivity}</p>
      ) : (
        <ul className="space-y-2">
          {activities.map((activity) => {
            const name = uiZh.teamFallback;
            return (
              <li
                key={activity.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar size="sm" className="bg-white/10 text-white">
                    <AvatarFallback className="bg-white/10 text-[10px] text-white/80">
                      {initials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-sm text-white/90">{activity.message}</p>
                      <p className="text-[11px] text-white/35">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canRead && activities.length > 0 ? (
        <div className="mt-3">
          <Link
            href={timelineHref}
            className="text-xs text-white/45 hover:text-white/70"
          >
            View full timeline →
          </Link>
        </div>
      ) : null}
    </DashboardSection>
  );
}
