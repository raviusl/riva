import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";

type PreferencesSettingsSectionProps = {
  timezone?: string | null;
  locale?: string | null;
  currency?: string | null;
};

/**
 * Personal preferences architecture — preview values from active company/workspace.
 * Persistence of user-level prefs is intentionally deferred.
 */
export function PreferencesSettingsSection({
  timezone = null,
  locale = null,
  currency = null,
}: PreferencesSettingsSectionProps) {
  return (
    <div className="space-y-4">
      <SettingsSectionCard
        title={uiZh.defaults}
        description={uiZh.defaultsDesc}
      >
        <dl className="space-y-3 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.timezone}</dt>
            <dd className="text-white">{timezone || uiZh.emDash}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.locale}</dt>
            <dd className="text-white">{locale || uiZh.emDash}</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
            <dt className="text-white/45">{uiZh.currency}</dt>
            <dd className="text-white">{currency || uiZh.emDash}</dd>
          </div>
        </dl>
      </SettingsSectionCard>

      <SettingsSectionCard
        title={uiZh.personalOverrides}
        description={uiZh.personalOverridesDesc}
      >
        <p className="text-sm text-white/45">{uiZh.personalOverridesBody}</p>
      </SettingsSectionCard>
    </div>
  );
}
