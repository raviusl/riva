import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";
import { AUTH_UPDATE_PASSWORD_PATH } from "@/lib/auth/routes";

/**
 * Security settings — navigation to existing auth flows only.
 * Does not redesign Authentication.
 */
export function SecuritySettingsSection() {
  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title={uiZh.password}
        description={uiZh.passwordDesc}
      >
        <Link
          href={AUTH_UPDATE_PASSWORD_PATH}
          className="inline-flex rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.05]"
        >
          {uiZh.updatePasswordLink}
        </Link>
      </SettingsSectionCard>

      <SettingsSectionCard
        title={uiZh.sessions}
        description={uiZh.sessionsDesc}
      >
        <ul className="space-y-2 text-sm text-white/55">
          <li className="rounded-xl border border-white/[0.06] px-4 py-3">
            {uiZh.sessionTokenRefresh}
          </li>
          <li className="rounded-xl border border-white/[0.06] px-4 py-3">
            {uiZh.sessionSignOut}
          </li>
          <li className="rounded-xl border border-white/[0.06] px-4 py-3">
            {uiZh.sessionMultiDevice}
          </li>
        </ul>
      </SettingsSectionCard>
    </div>
  );
}
