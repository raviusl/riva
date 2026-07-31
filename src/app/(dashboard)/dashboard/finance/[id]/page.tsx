import { redirect } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { requireDashboardContext } from "@/core/auth/context";
import { FinanceWorkspace } from "@/features/finance/components/finance-workspace";
import { getFinanceWorkspacePreview } from "@/features/finance/lib/finance-workspace-preview";
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
  await requireDashboardContext();

  const hubId = id.trim() || FINANCE_WORKSPACE_HUB_ID;
  const initialTab = parseFinanceWorkspaceTab(query.tab);

  if (hubId !== FINANCE_WORKSPACE_HUB_ID) {
    redirect(
      buildFinanceWorkspaceTabHref(FINANCE_WORKSPACE_HUB_ID, initialTab, {
        explicitOverview: true,
      }),
    );
  }

  const model = getFinanceWorkspacePreview(FINANCE_WORKSPACE_HUB_ID);

  return (
    <WorkspaceLayout backHref="/dashboard/finance" backLabel="← Finance">
      <FinanceWorkspace model={model} initialTab={initialTab} />
    </WorkspaceLayout>
  );
}
