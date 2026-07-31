import { redirect } from "next/navigation";

import { requireSessionUserId } from "@/core/auth/session";
import { resolveActiveCompany } from "@/core/company/active-company";
import {
  listDivisionsForBusiness,
} from "@/core/os/business";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { OsDivisionPicker } from "@/features/os/components/os-division-picker";
import { OsEntryShell } from "@/features/os/components/os-entry-shell";
import { OS_BUSINESS_PATH } from "@/lib/os/entry-paths";

export default async function OsDivisionPage() {
  const userId = await requireSessionUserId();
  const workspace = await resolveActiveWorkspace(userId);
  if (!workspace) {
    redirect(OS_BUSINESS_PATH);
  }

  const companyContext = await resolveActiveCompany(userId, workspace);
  if (!companyContext) {
    redirect(OS_BUSINESS_PATH);
  }

  const divisions = await listDivisionsForBusiness(
    workspace.id,
    companyContext.company.id,
  );

  if (divisions.length <= 1) {
    redirect("/dashboard");
  }

  return (
    <OsEntryShell>
      <OsDivisionPicker
        businessName={companyContext.company.name}
        divisions={divisions}
      />
    </OsEntryShell>
  );
}
