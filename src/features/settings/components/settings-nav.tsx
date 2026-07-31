import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import type { SettingsSectionId } from "@/features/settings/lib/settings-sections";
import {
  SETTINGS_SECTIONS,
  settingsSectionsByGroup,
} from "@/features/settings/lib/settings-sections";
import { cn } from "@/lib/utils";

type SettingsNavProps = {
  activeSection?: SettingsSectionId | null;
};

const GROUP_LABELS = {
  account: uiZh.account,
  organization: uiZh.organization,
  platform: uiZh.platform,
} as const;

export function SettingsNav({ activeSection = null }: SettingsNavProps) {
  const groups = ["account", "organization", "platform"] as const;

  return (
    <nav aria-label={uiZh.settingsSectionsAria} className="space-y-6">
      {groups.map((group) => {
        const sections = settingsSectionsByGroup(group);
        if (sections.length === 0) return null;
        return (
          <div key={group}>
            <p className="mb-2 px-1 text-[10px] font-medium tracking-[0.08em] text-white/35 uppercase">
              {GROUP_LABELS[group]}
            </p>
            <ul className="space-y-1">
              {sections.map((section) => {
                const active = section.id === activeSection;
                return (
                  <li key={section.id}>
                    <Link
                      href={section.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-white/[0.06] text-white"
                          : "text-white/55 hover:bg-white/[0.04] hover:text-white/85",
                      )}
                    >
                      <span>{section.label}</span>
                      {section.placeholder ? (
                        <span className="text-[10px] text-white/30">
                          {uiZh.soon}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="border-t border-white/[0.06] pt-4">
        <p className="px-1 text-[10px] text-white/30">
          {uiZh.sectionsCount(SETTINGS_SECTIONS.length)}
        </p>
      </div>
    </nav>
  );
}
