import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listQuotations } from "@/core/finance/quotation";
import { listProjectsByCompany } from "@/core/project/project";
import { QuotationList } from "@/features/finance/components/quotations/quotation-list";
import type { FinanceWorkspaceItem } from "@/features/finance/lib/finance-types";

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
    const [quotations, clients, projects] = await Promise.all([
      listQuotations({
        companyId: context.company.id,
        workspaceId: context.workspace.id,
      }),
      listClientsByCompany(context.workspace.id, context.company.id),
      listProjectsByCompany(context.workspace.id, context.company.id),
    ]);

    const clientNames = new Map(clients.map((client) => [client.id, client.name]));
    const projectNames = new Map(
      projects.map((project) => [project.id, project.name]),
    );

    records = quotations.map((quotation) => ({
      ...quotation,
      clientName: quotation.clientId
        ? (clientNames.get(quotation.clientId) ?? null)
        : null,
      projectName: quotation.projectId
        ? (projectNames.get(quotation.projectId) ?? null)
        : null,
      vendorName: null,
    }));
  } catch (error) {
    console.error("QuotationsPage list failed", error);
  }

  return (
    <QuotationList
      rows={records}
      canWrite={context.permissions.has("finance.write")}
      businessName={context.company.name}
    />
  );
}
