import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { FINANCE_WORKSPACE_HUB_ID } from "@/features/finance/lib/finance-workspace-tabs";
import { buildFinanceWorkspaceTabHref } from "@/features/finance/lib/finance-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export default async function FinancePage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("finance.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionFinance}
      </div>
    );
  }

  const workspaceHref = buildWorkspaceOverviewHref(
    "finance",
    FINANCE_WORKSPACE_HUB_ID,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.financePageTitle}</h1>
          <p className="mt-2 text-sm text-white/45">{uiZh.financePageDesc}</p>
        </div>
        <Link
          href={workspaceHref}
          className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {uiZh.openWorkspace}
        </Link>
      </div>

      <ModuleEmptyState
        title={uiZh.financeWorkspaceTitle}
        description={uiZh.financeWorkspaceEmptyDesc}
        actionHref={workspaceHref}
        actionLabel={uiZh.openFinanceWorkspace}
      />

      <p className="text-center text-xs text-white/35">
        {uiZh.orOpen}{" "}
        <Link
          href={buildFinanceWorkspaceTabHref(
            FINANCE_WORKSPACE_HUB_ID,
            "transactions",
          )}
          className="text-white/55 hover:text-white/80"
        >
          /dashboard/finance/workspace?tab=transactions
        </Link>
      </p>
    </div>
  );
}
