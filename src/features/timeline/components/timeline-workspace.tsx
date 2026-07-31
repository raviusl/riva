"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { CalendarEnginePanel } from "@/features/calendar-engine";
import { TimelineFeedList } from "@/features/timeline/components/timeline-feed-list";
import { TimelineWorkspaceHeader } from "@/features/timeline/components/timeline-workspace-header";
import { TimelineWorkspaceOverview } from "@/features/timeline/components/timeline-workspace-overview";
import type { TimelineWorkspaceModel } from "@/features/timeline/lib/timeline-types";
import {
  DEFAULT_TIMELINE_WORKSPACE_TAB,
  TIMELINE_WORKSPACE_TABS,
  buildTimelineWorkspaceTabHref,
  parseTimelineWorkspaceTab,
  type TimelineWorkspaceTabId,
} from "@/features/timeline/lib/timeline-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type TimelineWorkspaceProps = {
  model: TimelineWorkspaceModel;
  initialTab?: TimelineWorkspaceTabId;
};

export function TimelineWorkspace({
  model,
  initialTab = DEFAULT_TIMELINE_WORKSPACE_TAB,
}: TimelineWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseTimelineWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseTimelineWorkspaceTab(tabId);
      return buildTimelineWorkspaceTabHref(model.id, tab, {
        explicitOverview: true,
      });
    },
    [model.id],
  );

  return (
    <div className="space-y-6">
      <TimelineWorkspaceHeader workspace={model} />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={TIMELINE_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <TimelineWorkspaceOverview workspace={model} />
        ) : null}

        {activeTab === "timeline" ? (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
            <h2 className="text-sm font-medium text-white">{uiZh.timeline}</h2>
            <p className="mt-1 text-xs text-white/45">
              Chronological feed across meetings, tasks, and activity
            </p>
            <div className="mt-4">
              <TimelineFeedList
                items={model.feed.items}
                emptyTitle={uiZh.timelineEmpty}
                emptyDescription={uiZh.timelineEmptyDesc}
              />
            </div>
          </section>
        ) : null}

        {activeTab === "calendar" ? (
          <CalendarEnginePanel
            workspaceId={model.workspaceId}
            companyId={model.companyId}
          />
        ) : null}

        {activeTab === "upcoming" ? (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
            <h2 className="text-sm font-medium text-white">{uiZh.upcoming}</h2>
            <p className="mt-1 text-xs text-white/45">
              Items scheduled at or after now
            </p>
            <div className="mt-4">
              <TimelineFeedList
                items={model.feed.upcoming}
                emptyTitle={uiZh.nothingUpcoming}
                emptyDescription={uiZh.nothingUpcomingDesc}
              />
            </div>
          </section>
        ) : null}

        {activeTab === "past" ? (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
            <h2 className="text-sm font-medium text-white">{uiZh.past}</h2>
            <p className="mt-1 text-xs text-white/45">
              Items that occurred before now
            </p>
            <div className="mt-4">
              <TimelineFeedList
                items={model.feed.past}
                emptyTitle={uiZh.noPastItems}
                emptyDescription={uiZh.noPastItemsDesc}
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
