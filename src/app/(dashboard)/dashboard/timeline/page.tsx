import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { TIMELINE_WORKSPACE_HUB_ID } from "@/features/timeline/lib/timeline-workspace-tabs";
import { buildTimelineWorkspaceTabHref } from "@/features/timeline/lib/timeline-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export default async function TimelinePage() {
  await requireDashboardContext();

  const workspaceHref = buildWorkspaceOverviewHref(
    "timeline",
    TIMELINE_WORKSPACE_HUB_ID,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.timelinePageTitle}</h1>
          <p className="mt-2 text-sm text-white/45">{uiZh.timelinePageDesc}</p>
        </div>
        <Link
          href={workspaceHref}
          className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {uiZh.openWorkspace}
        </Link>
      </div>

      <ModuleEmptyState
        title={uiZh.timelineWorkspaceTitle}
        description={uiZh.timelineWorkspaceEmptyDesc}
        actionHref={workspaceHref}
        actionLabel={uiZh.openTimelineWorkspace}
      />

      <p className="text-center text-xs text-white/35">
        {uiZh.orOpen}{" "}
        <Link
          href={buildTimelineWorkspaceTabHref(
            TIMELINE_WORKSPACE_HUB_ID,
            "timeline",
          )}
          className="text-white/55 hover:text-white/80"
        >
          /dashboard/timeline/workspace?tab=timeline
        </Link>
      </p>
    </div>
  );
}
