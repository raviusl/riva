/**
 * Platform Settings section catalog (Project 051).
 */

import { uiZh } from "@/config/ui-zh";

export const SETTINGS_SECTION_IDS = [
  "profile",
  "company",
  "workspace",
  "preferences",
  "notifications",
  "appearance",
  "security",
  "members",
  "integrations",
  "billing",
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_IDS)[number];

export type SettingsSectionDefinition = {
  id: SettingsSectionId;
  label: string;
  description: string;
  href: string;
  /** Placeholder until domain implementation lands. */
  placeholder: boolean;
  group: "account" | "organization" | "platform";
};

export const SETTINGS_SECTIONS: readonly SettingsSectionDefinition[] = [
  {
    id: "profile",
    label: uiZh.profile,
    description: uiZh.settingsProfileSectionDesc,
    href: "/dashboard/settings/profile",
    placeholder: false,
    group: "account",
  },
  {
    id: "preferences",
    label: uiZh.preferences,
    description: uiZh.settingsPreferencesSectionDesc,
    href: "/dashboard/settings/preferences",
    placeholder: false,
    group: "account",
  },
  {
    id: "notifications",
    label: uiZh.notifications,
    description: uiZh.settingsNotificationsSectionDesc,
    href: "/dashboard/settings/notifications",
    placeholder: false,
    group: "account",
  },
  {
    id: "appearance",
    label: uiZh.appearance,
    description: uiZh.settingsAppearanceSectionDesc,
    href: "/dashboard/settings/appearance",
    placeholder: false,
    group: "account",
  },
  {
    id: "security",
    label: uiZh.security,
    description: uiZh.settingsSecuritySectionDesc,
    href: "/dashboard/settings/security",
    placeholder: false,
    group: "account",
  },
  {
    id: "company",
    label: uiZh.company,
    description: uiZh.settingsCompanySectionDesc,
    href: "/dashboard/settings/company",
    placeholder: false,
    group: "organization",
  },
  {
    id: "workspace",
    label: uiZh.workspace,
    description: uiZh.settingsWorkspaceSectionDesc,
    href: "/dashboard/settings/workspace",
    placeholder: false,
    group: "organization",
  },
  {
    id: "members",
    label: uiZh.members,
    description: uiZh.settingsMembersSectionDesc,
    href: "/dashboard/settings/members",
    placeholder: true,
    group: "organization",
  },
  {
    id: "integrations",
    label: uiZh.integrations,
    description: uiZh.settingsIntegrationsSectionDesc,
    href: "/dashboard/settings/integrations",
    placeholder: true,
    group: "platform",
  },
  {
    id: "billing",
    label: uiZh.billing,
    description: uiZh.settingsBillingSectionDesc,
    href: "/dashboard/settings/billing",
    placeholder: true,
    group: "platform",
  },
] as const;

export const SETTINGS_HUB_HREF = "/dashboard/settings";

export function getSettingsSection(
  id: SettingsSectionId,
): SettingsSectionDefinition {
  const section = SETTINGS_SECTIONS.find((item) => item.id === id);
  if (!section) {
    throw new Error(`Unknown settings section: ${id}`);
  }
  return section;
}

export function isSettingsSectionId(
  value: string | null | undefined,
): value is SettingsSectionId {
  return SETTINGS_SECTION_IDS.includes(value as SettingsSectionId);
}

export function settingsSectionsByGroup(
  group: SettingsSectionDefinition["group"],
) {
  return SETTINGS_SECTIONS.filter((section) => section.group === group);
}
