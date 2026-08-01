import { redirect } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { FinanceWorkspace } from "@/features/finance/components/finance-workspace";
import { loadFinanceWorkspace } from "@/features/finance/lib/load-finance-workspace";
import {
  FINANCE_WORKSPACE_HUB_ID,
  buildFinanceWorkspaceTabHref,
  parseFinanceWorkspaceTab,
} from "@/features/finance/lib/finance-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function FinanceWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("finance.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionFinance}
      </div>
    );
  }

  const hubId = id.trim() || FINANCE_WORKSPACE_HUB_ID;
  const initialTab = parseFinanceWorkspaceTab(query.tab);

  if (hubId !== FINANCE_WORKSPACE_HUB_ID) {
    redirect(
      buildFinanceWorkspaceTabHref(FINANCE_WORKSPACE_HUB_ID, initialTab, {
        explicitOverview: true,
      }),
    );
  }

  const model = await loadFinanceWorkspace({
    companyId: context.company.id,
    workspaceId: context.workspace.id,
    hubId: FINANCE_WORKSPACE_HUB_ID,
  });

  return (
    <WorkspaceLayout backHref="/dashboard/finance" backLabel="← Finance">
      <FinanceWorkspace
        model={model}
        initialTab={initialTab}
        canCreateQuotation={context.permissions.has("finance.write")}
      />
    </WorkspaceLayout>
  );
}
