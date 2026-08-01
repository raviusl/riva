import Link from "next/link";
import { redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { CreateQuotationForm } from "@/features/finance/components/quotations/create-quotation-form";
import {
  FINANCE_WORKSPACE_HUB_ID,
  buildFinanceWorkspaceTabHref,
} from "@/features/finance/lib/finance-workspace-tabs";

type PageProps = {
  searchParams: Promise<{
    projectId?: string;
    clientId?: string;
  }>;
};

export default async function NewQuotationPage({ searchParams }: PageProps) {
  const context = await requireDashboardContext();
  const params = await searchParams;

  if (!context.permissions.has("finance.write")) {
    redirect(
      buildFinanceWorkspaceTabHref(FINANCE_WORKSPACE_HUB_ID, "quotations", {
        explicitOverview: true,
      }),
    );
  }

  const [projects, clients, vendors] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listVendorsByCompany(context.workspace.id, context.company.id),
  ]);

  const requestedProjectId = params.projectId?.trim() ?? "";
  const requestedClientId = params.clientId?.trim() ?? "";
  const defaultProjectId = projects.some(
    (project) => project.id === requestedProjectId,
  )
    ? requestedProjectId
    : "";
  const defaultClientId = clients.some(
    (client) => client.id === requestedClientId,
  )
    ? requestedClientId
    : "";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <Link
          href={buildFinanceWorkspaceTabHref(
            FINANCE_WORKSPACE_HUB_ID,
            "quotations",
            { explicitOverview: true },
          )}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToQuotations}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.createQuotation}</h1>
        <p className="mt-2 text-sm text-white/45">{context.company.name}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateQuotationForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          projects={projects}
          clients={clients}
          vendors={vendors}
          defaultProjectId={defaultProjectId}
          defaultClientId={defaultClientId}
        />
      </div>
    </div>
  );
}
