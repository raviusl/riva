import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";
import type { SettingsProfilePreview } from "@/features/settings/lib/settings-types";

type ProfileSettingsSectionProps = {
  profile: SettingsProfilePreview;
};

/**
 * Profile settings — read-only preview architecture (no auth redesign).
 */
export function ProfileSettingsSection({ profile }: ProfileSettingsSectionProps) {
  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title={uiZh.identity}
        description={uiZh.identityDesc}
      >
        <dl className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.displayName}</dt>
            <dd className="text-white">{profile.displayName}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.email}</dt>
            <dd className="text-white">{profile.email ?? uiZh.emDash}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.userId}</dt>
            <dd className="truncate font-mono text-xs text-white/70">
              {profile.userId}
            </dd>
          </div>
        </dl>
      </SettingsSectionCard>

      <SettingsSectionCard
        title={uiZh.activeContext}
        description={uiZh.activeContextDesc}
      >
        <dl className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.workspace}</dt>
            <dd className="text-white">{profile.workspaceName ?? uiZh.emDash}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.company}</dt>
            <dd className="text-white">{profile.companyName ?? uiZh.emDash}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.role}</dt>
            <dd className="capitalize text-white">{profile.roleKey ?? uiZh.emDash}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-white/35">
          {uiZh.profileEditingLater}{" "}
          <Link
            href="/dashboard/settings/security"
            className="text-white/55 hover:text-white/80"
          >
            {uiZh.securitySettingsLink}
          </Link>
        </p>
      </SettingsSectionCard>
    </div>
  );
}
