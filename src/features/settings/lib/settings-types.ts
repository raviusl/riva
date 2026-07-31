/**
 * Platform Settings shared types (Project 051).
 */

import type { SettingsSectionId } from "@/features/settings/lib/settings-sections";

export type SettingsProfilePreview = {
  userId: string;
  email: string | null;
  displayName: string;
  roleKey: string | null;
  workspaceName: string | null;
  companyName: string | null;
};

export type SettingsContextPreview = {
  workspaceId: string | null;
  workspaceName: string | null;
  companyId: string | null;
  companyName: string | null;
  roleKey: string | null;
  canWriteCompany: boolean;
  canWriteWorkspace: boolean;
};

export type SettingsPageModel = {
  activeSection: SettingsSectionId;
  profile: SettingsProfilePreview;
  context: SettingsContextPreview;
  isSuperAdmin: boolean;
};
