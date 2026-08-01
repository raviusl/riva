import "server-only";

import { getClientById } from "@/core/client/client";
import { listQuotationActivities } from "@/core/finance/activity";
import { listQuotations } from "@/core/finance/quotation";
import type { Quotation } from "@/core/finance/types";
import { getProjectById } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import type {
  FinanceActivityItem,
  FinanceWorkspaceItem,
  FinanceWorkspaceModel,
} from "@/features/finance/lib/finance-types";
import { getFinanceWorkspacePreview } from "@/features/finance/lib/finance-workspace-preview";
import { FINANCE_WORKSPACE_HUB_ID } from "@/features/finance/lib/finance-workspace-tabs";

async function labelQuotation(
  quotation: Quotation,
  workspaceId: string,
  companyId: string,
): Promise<FinanceWorkspaceItem> {
  const [projectName, clientName, vendorName] = await Promise.all([
    (async () => {
      if (!quotation.projectId) return null;
      try {
        const project = await getProjectById(quotation.projectId, workspaceId);
        return project.company_id === companyId ? project.name : null;
      } catch {
        return null;
      }
    })(),
    (async () => {
      if (!quotation.clientId) return null;
      try {
        const client = await getClientById(
          quotation.clientId,
          workspaceId,
          companyId,
        );
        return client.name;
      } catch {
        return null;
      }
    })(),
    (async () => {
      if (!quotation.vendorId) return null;
      try {
        const vendor = await getVendorById(
          quotation.vendorId,
          workspaceId,
          companyId,
        );
        return vendor.name;
      } catch {
        return null;
      }
    })(),
  ]);

  return {
    ...quotation,
    projectName,
    clientName,
    vendorName,
  };
}

/**
 * Finance Workspace model: preview for non-quotation tabs + live quotations.
 */
export async function loadFinanceWorkspace(input: {
  companyId: string;
  workspaceId: string;
  hubId?: string;
}): Promise<FinanceWorkspaceModel> {
  const hubId = input.hubId ?? FINANCE_WORKSPACE_HUB_ID;
  const preview = getFinanceWorkspacePreview(hubId);

  let quotations: FinanceWorkspaceItem[] = [];
  let activities: FinanceActivityItem[] = preview.activities;

  try {
    const rows = await listQuotations({
      companyId: input.companyId,
      workspaceId: input.workspaceId,
    });
    quotations = await Promise.all(
      rows.map((row) =>
        labelQuotation(row, input.workspaceId, input.companyId),
      ),
    );

    const liveActivities = await listQuotationActivities({
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      limit: 40,
    });
    if (liveActivities.length > 0) {
      activities = liveActivities.map((row) => ({
        id: row.id,
        actorLabel: row.actorId,
        message: row.message,
        createdAt: row.createdAt,
      }));
    }
  } catch (error) {
    console.error("loadFinanceWorkspace quotations failed", error);
  }

  const nonQuotation = preview.records.filter((row) => row.type !== "quotation");

  return {
    ...preview,
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    records: [...nonQuotation, ...quotations],
    activities,
  };
}
