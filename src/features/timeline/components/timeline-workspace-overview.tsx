import Link from "next/link";
import type { ReactNode } from "react";

import type { TimelineWorkspaceModel } from "@/features/timeline/lib/timeline-types";
import { buildTimelineWorkspaceTabHref } from "@/features/timeline/lib/timeline-workspace-tabs";
import { TimelineFeedList } from "@/features/timeline/components/timeline-feed-list";
import { uiZh } from "@/config/ui-zh";

type TimelineWorkspaceOverviewProps = {
  workspace: TimelineWorkspaceModel;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

export function TimelineWorkspaceOverview({
  workspace,
}: TimelineWorkspaceOverviewProps) {
  const { items, upcoming, past } = workspace.feed;
  const meetings = items.filter((item) => item.kind === "meeting").length;
  const tasks = items.filter((item) => item.kind === "task").length;
  const activities = items.filter(
    (item) => item.kind === "task_activity",
  ).length;
  const recent = items.slice(0, 5);
  const timelineHref = buildTimelineWorkspaceTabHref(workspace.id, "timeline", {
    explicitOverview: true,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.timelineSummary}</h2>
            <p className="mt-1 text-xs text-white/45">
              Aggregated meetings, tasks, and task activity
            </p>
          </div>
          <Link
            href={timelineHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            Open timeline
          </Link>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.total} value={String(items.length)} />
          <InfoRow label={uiZh.meetings} value={String(meetings)} />
          <InfoRow label={uiZh.tasks} value={String(tasks)} />
          <InfoRow label={uiZh.taskActivity} value={String(activities)} />
          <InfoRow label={uiZh.upcoming} value={String(upcoming.length)} />
          <InfoRow label={uiZh.past} value={String(past.length)} />
          <InfoRow label={uiZh.futureEvents} value={uiZh.placeholderValue} />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.recentLabel}</h2>
        <p className="mt-1 text-xs text-white/45">
          Newest chronological items across the platform
        </p>
        <div className="mt-4">
          <TimelineFeedList
            items={recent}
            emptyTitle={uiZh.noTimelineItemsYet}
            emptyDescription={uiZh.noTimelineItemsDesc}
          />
        </div>
      </section>
    </div>
  );
}
