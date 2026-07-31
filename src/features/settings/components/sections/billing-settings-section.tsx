import { uiZh } from "@/config/ui-zh";
import { SettingsPlaceholderPanel } from "@/features/settings/components/settings-placeholder-panel";

/**
 * Billing placeholder — no payment providers in Project 051.
 */
export function BillingSettingsSection() {
  return (
    <SettingsPlaceholderPanel
      title={uiZh.billing}
      description={uiZh.billingPlaceholderDesc}
    />
  );
}
