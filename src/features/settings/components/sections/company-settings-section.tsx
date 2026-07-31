import type { ReactNode } from "react";

import { uiZh } from "@/config/ui-zh";
import { SettingsSectionCard } from "@/features/settings/components/settings-section-card";

type CompanySettingsSectionProps = {
  companyName: string;
  canWrite: boolean;
  children: ReactNode;
};

/**
 * Company settings section shell — reuses existing CompanySettingsForm as children.
 */
export function CompanySettingsSection({
  companyName,
  canWrite,
  children,
}: CompanySettingsSectionProps) {
  return (
    <SettingsSectionCard
      title={uiZh.companyProfile}
      description={
        canWrite
          ? uiZh.editSettingsFor(companyName)
          : uiZh.viewingNoWriteAccess(companyName)
      }
    >
      {children}
    </SettingsSectionCard>
  );
}
