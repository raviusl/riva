import Link from "next/link";
import { redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listFinancePackages } from "@/core/finance/packages";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { QuotationEditor } from "@/features/finance/components/quotations/quotation-editor";
import {
  FINANCE_WORKSPACE_HUB_ID,
  buildFinanceWorkspaceTabHref,
} from "@/features/finance/lib/finance-workspace-tabs";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();
  const [{ data: profile }, projects, clients, vendors, packages] =
    await Promise.all([
      admin
        .from("profiles")
        .select("full_name, display_name")
        .eq("id", context.userId)
        .maybeSingle(),
      listProjectsByCompany(context.workspace.id, context.company.id),
      listClientsByCompany(context.workspace.id, context.company.id),
      listVendorsByCompany(context.workspace.id, context.company.id),
      listFinancePackages({
        workspaceId: context.workspace.id,
        companyId: context.company.id,
      }).catch(() => []),
    ]);

  const preparedByName =
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    "";

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
    <div className="mx-auto w-full max-w-4xl space-y-8">
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

      <QuotationEditor
        mode="create"
        workspaceId={context.workspace.id}
        company={context.company}
        projects={projects}
        clients={clients}
        vendors={vendors}
        packages={packages}
        preparedByName={preparedByName}
        defaultProjectId={defaultProjectId}
        defaultClientId={defaultClientId}
      />
    </div>
  );
}
