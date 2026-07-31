import "server-only";

import { listCompaniesForUserInWorkspace } from "@/core/company/active-company";
import type { Company } from "@/core/types";
import { listWorkspacesForUser } from "@/core/workspace/active-workspace";

/**
 * Business = Company tenant (product naming).
 * Listed across memberships for the OS Business Picker.
 */
export type BusinessOption = {
  company: Company;
  workspaceId: string;
  workspaceName: string;
};

export async function listBusinessesForUser(
  userId: string,
): Promise<BusinessOption[]> {
  const workspaces = await listWorkspacesForUser(userId);
  const byCompany = new Map<string, BusinessOption>();

  for (const workspace of workspaces) {
    const companies = await listCompaniesForUserInWorkspace(
      userId,
      workspace.id,
    );
    for (const company of companies) {
      if (company.status === "archived") continue;
      if (byCompany.has(company.id)) continue;
      byCompany.set(company.id, {
        company,
        workspaceId: workspace.id,
        workspaceName: workspace.name,
      });
    }
  }

  return [...byCompany.values()].sort((a, b) =>
    a.company.name.localeCompare(b.company.name),
  );
}

/**
 * Divisions (Business Units) are not modeled yet.
 * Returns empty — picker is skipped when N/A.
 */
export async function listDivisionsForBusiness(
  _workspaceId: string,
  _companyId: string,
): Promise<Array<{ id: string; name: string }>> {
  return [];
}
