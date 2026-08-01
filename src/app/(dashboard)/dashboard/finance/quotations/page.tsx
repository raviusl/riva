import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listQuotations } from "@/core/finance/quotation";
import type { Quotation } from "@/core/finance/types";
import { getClientById } from "@/core/client/client";
import { getProjectById } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import { FinanceWorkspaceQuotationsPanel } from "@/features/finance/components/finance-workspace-quotations-panel";
import type { FinanceWorkspaceItem } from "@/features/finance/lib/finance-types";

async function toWorkspaceItem(
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

export default async function QuotationsPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("finance.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionFinance}
      </div>
    );
  }

  let records: FinanceWorkspaceItem[] = [];
  try {
    const quotations = await listQuotations({
      companyId: context.company.id,
      workspaceId: context.workspace.id,
    });
    records = await Promise.all(
      quotations.map((row) =>
        toWorkspaceItem(row, context.workspace.id, context.company.id),
      ),
    );
  } catch (error) {
    console.error("QuotationsPage list failed", error);
  }

  const canWrite = context.permissions.has("finance.write");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/40">{uiZh.navFinance}</p>
          <h1 className="mt-1 text-xl text-white">{uiZh.quotations}</h1>
        </div>
        <Link
          href="/dashboard/finance"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← {uiZh.navFinance}
        </Link>
      </div>

      <FinanceWorkspaceQuotationsPanel
        records={records}
        canCreate={canWrite}
      />
    </div>
  );
}
