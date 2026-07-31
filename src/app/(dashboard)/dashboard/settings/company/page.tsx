import { redirect } from "next/navigation";

import { CompanySettingsForm } from "@/features/company/components/company-settings-form";
import { CompanySettingsSection } from "@/features/settings/components/sections/company-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function CompanySettingsPage() {
  const { context, sessionContext } = await loadSettingsPageContext();

  if (!sessionContext) {
    redirect("/dashboard/select-company");
  }

  return (
    <SettingsShell
      activeSection="company"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <CompanySettingsSection
        companyName={sessionContext.company.name}
        canWrite={context.canWriteCompany}
      >
        <CompanySettingsForm
          company={sessionContext.company}
          canWrite={context.canWriteCompany}
        />
      </CompanySettingsSection>
    </SettingsShell>
  );
}
