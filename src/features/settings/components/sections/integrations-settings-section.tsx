import { uiZh } from "@/config/ui-zh";
import { SettingsPlaceholderPanel } from "@/features/settings/components/settings-placeholder-panel";

/**
 * Integrations placeholder — no providers in Project 051.
 */
export function IntegrationsSettingsSection() {
  return (
    <SettingsPlaceholderPanel
      title={uiZh.integrations}
      description={uiZh.integrationsPlaceholderDesc}
    />
  );
}
