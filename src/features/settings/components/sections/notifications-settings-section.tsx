import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";
import { NOTIFICATION_WORKSPACE_HUB_ID } from "@/features/notification/lib/notification-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

/**
 * Notification preferences architecture — links to Notification Workspace preview.
 * No delivery provider configuration here.
 */
export function NotificationsSettingsSection() {
  const inboxHref = buildWorkspaceOverviewHref(
    "notification",
    NOTIFICATION_WORKSPACE_HUB_ID,
  );

  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title={uiZh.channels}
        description={uiZh.channelsDesc}
      >
        <ul className="space-y-2 text-sm text-white/55">
          <li className="rounded-xl border border-white/[0.06] px-4 py-3">
            {uiZh.channelInApp}
          </li>
          <li className="rounded-xl border border-white/[0.06] px-4 py-3">
            {uiZh.channelEmail}
          </li>
          <li className="rounded-xl border border-white/[0.06] px-4 py-3">
            {uiZh.channelDigests}
          </li>
        </ul>
      </SettingsSectionCard>

      <SettingsSectionCard title={uiZh.inbox} description={uiZh.inboxDesc}>
        <Link
          href={inboxHref}
          className="inline-flex rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.05]"
        >
          {uiZh.openNotificationWorkspace}
        </Link>
      </SettingsSectionCard>
    </div>
  );
}
