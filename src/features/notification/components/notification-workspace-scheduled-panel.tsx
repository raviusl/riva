import type { NotificationWorkspaceItem } from "@/features/notification/lib/notification-types";
import {
  formatNotificationDateTime,
  isScheduledStatus,
  notificationChannelLabel,
  notificationStatusLabel,
} from "@/features/notification/lib/notification-labels";
import { uiZh } from "@/config/ui-zh";

type NotificationWorkspaceScheduledPanelProps = {
  notifications: NotificationWorkspaceItem[];
};

export function NotificationWorkspaceScheduledPanel({
  notifications,
}: NotificationWorkspaceScheduledPanelProps) {
  const rows = notifications
    .filter(
      (row) =>
        Boolean(row.scheduledAt) &&
        (isScheduledStatus(row.status) || row.status === "pending"),
    )
    .sort((a, b) =>
      (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""),
    );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.tabScheduled}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.scheduledPanelDesc}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.nothingScheduled}</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/40">
                <th className="pb-2 pr-3 font-medium">{uiZh.titleLabel}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.scheduledTime}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.channel}</th>
                <th className="pb-2 font-medium">{uiZh.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.06] text-white/80"
                >
                  <td className="py-3 pr-3 text-white">{row.title}</td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {formatNotificationDateTime(row.scheduledAt)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {notificationChannelLabel(row.channel)}
                  </td>
                  <td className="py-3 text-xs text-white/55">
                    {notificationStatusLabel(row.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
