import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";

/**
 * Appearance settings architecture — documents theme surface without redesign.
 * App already uses a dark shell; light mode toggle is deferred.
 */
export function AppearanceSettingsSection() {
  return (
    <div className="space-y-4">
      <SettingsSectionCard title={uiZh.theme} description={uiZh.themeDesc}>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/20 bg-white/[0.06] px-4 py-3">
            <p className="text-sm text-white">{uiZh.darkTheme}</p>
            <p className="mt-1 text-xs text-white/40">{uiZh.themeActive}</p>
          </div>
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 opacity-50">
            <p className="text-sm text-white/70">{uiZh.lightTheme}</p>
            <p className="mt-1 text-xs text-white/35">{uiZh.themePlanned}</p>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title={uiZh.density} description={uiZh.densityDesc}>
        <p className="text-sm text-white/45">{uiZh.densityBody}</p>
      </SettingsSectionCard>
    </div>
  );
}
