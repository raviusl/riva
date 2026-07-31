/**
 * Platform Settings feature surface (Project 051).
 */

export {
  SETTINGS_HUB_HREF,
  SETTINGS_SECTION_IDS,
  SETTINGS_SECTIONS,
  getSettingsSection,
  isSettingsSectionId,
  settingsSectionsByGroup,
  type SettingsSectionDefinition,
  type SettingsSectionId,
} from "@/features/settings/lib/settings-sections";

export type {
  SettingsContextPreview,
  SettingsPageModel,
  SettingsProfilePreview,
} from "@/features/settings/lib/settings-types";

export { SettingsShell } from "@/features/settings/components/settings-shell";
export { SettingsNav } from "@/features/settings/components/settings-nav";
export { SettingsHeader } from "@/features/settings/components/settings-header";
export { SettingsSectionCard } from "@/features/settings/components/settings-section-card";
export { SettingsPlaceholderPanel } from "@/features/settings/components/settings-placeholder-panel";

export { ProfileSettingsSection } from "@/features/settings/components/sections/profile-settings-section";
export { CompanySettingsSection } from "@/features/settings/components/sections/company-settings-section";
export { WorkspaceSettingsSection } from "@/features/settings/components/sections/workspace-settings-section";
export { PreferencesSettingsSection } from "@/features/settings/components/sections/preferences-settings-section";
export { NotificationsSettingsSection } from "@/features/settings/components/sections/notifications-settings-section";
export { AppearanceSettingsSection } from "@/features/settings/components/sections/appearance-settings-section";
export { SecuritySettingsSection } from "@/features/settings/components/sections/security-settings-section";
export { MembersSettingsSection } from "@/features/settings/components/sections/members-settings-section";
export { IntegrationsSettingsSection } from "@/features/settings/components/sections/integrations-settings-section";
export { BillingSettingsSection } from "@/features/settings/components/sections/billing-settings-section";
