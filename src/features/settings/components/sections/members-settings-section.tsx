import { uiZh } from "@/config/ui-zh";
import { SettingsPlaceholderPanel } from "@/features/settings/components/settings-placeholder-panel";

/**
 * Members settings placeholder — invitation / membership UI is out of scope for 051.
 */
export function MembersSettingsSection() {
  return (
    <SettingsPlaceholderPanel
      title={uiZh.members}
      description={uiZh.membersPlaceholderDesc}
    />
  );
}
