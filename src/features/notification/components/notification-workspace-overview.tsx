import Link from "next/link";
import type { ReactNode } from "react";

import type { NotificationWorkspaceModel } from "@/features/notification/lib/notification-types";
import {
  formatNotificationDateTime,
  notificationChannelLabel,
} from "@/features/notification/lib/notification-labels";
import { buildNotificationWorkspaceTabHref } from "@/features/notification/lib/notification-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type NotificationWorkspaceOverviewProps = {
  workspace: NotificationWorkspaceModel;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

export function NotificationWorkspaceOverview({
  workspace,
}: NotificationWorkspaceOverviewProps) {
  const { summary, activities } = workspace;
  const recent = activities.slice(0, 5);
  const inboxHref = buildNotificationWorkspaceTabHref(workspace.id, "inbox");
  const activityHref = buildNotificationWorkspaceTabHref(
    workspace.id,
    "activity",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">
              {uiZh.notificationSummaryTitle}
            </h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.notificationTotalsDesc}
            </p>
          </div>
          <Link
            href={inboxHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.openInbox}
          </Link>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.totalNotifications} value={String(summary.total)} />
          <InfoRow label={uiZh.unread} value={String(summary.unread)} />
          <InfoRow label={uiZh.tabScheduled} value={String(summary.scheduled)} />
          <InfoRow label={uiZh.failed} value={String(summary.failed)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.channelSummary}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.channelCountsDesc}
        </p>
        {summary.channelSummary.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noChannelActivity}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {summary.channelSummary.map((row) => (
              <li
                key={row.channel}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm"
              >
                <span className="text-white/80">
                  {notificationChannelLabel(row.channel)}
                </span>
                <span className="text-white/45">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.recentActivityTitle2}</h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.latestNotificationHistory}
            </p>
          </div>
          <Link
            href={activityHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.viewActivity}
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noActivityYet}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white/80">{item.message}</p>
                  <time className="text-[11px] text-white/35">
                    {formatNotificationDateTime(item.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {item.actorLabel ?? uiZh.unknown}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
