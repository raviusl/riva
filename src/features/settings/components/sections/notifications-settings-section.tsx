import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";

/**
 * Notification preferences shell — channels are documented only.
 * Internal MVP Phase 1: no link to Notification Workspace preview.
 */
export function NotificationsSettingsSection() {
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
        <p className="text-sm text-white/50">{uiZh.notificationCenterDesc}</p>
      </SettingsSectionCard>
    </div>
  );
}
