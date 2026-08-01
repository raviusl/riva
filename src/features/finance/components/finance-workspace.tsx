"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { FinanceWorkspaceActivityPanel } from "@/features/finance/components/finance-workspace-activity-panel";
import { FinanceWorkspaceBudgetPanel } from "@/features/finance/components/finance-workspace-budget-panel";
import { FinanceWorkspaceHeader } from "@/features/finance/components/finance-workspace-header";
import { FinanceWorkspaceInvoicesPanel } from "@/features/finance/components/finance-workspace-invoices-panel";
import { FinanceWorkspaceOverview } from "@/features/finance/components/finance-workspace-overview";
import { FinanceWorkspaceQuotationsPanel } from "@/features/finance/components/finance-workspace-quotations-panel";
import { FinanceWorkspaceReportsPanel } from "@/features/finance/components/finance-workspace-reports-panel";
import { FinanceWorkspaceTransactionsPanel } from "@/features/finance/components/finance-workspace-transactions-panel";
import type { FinanceWorkspaceModel } from "@/features/finance/lib/finance-types";
import {
  DEFAULT_FINANCE_WORKSPACE_TAB,
  FINANCE_WORKSPACE_TABS,
  buildFinanceWorkspaceTabHref,
  parseFinanceWorkspaceTab,
  type FinanceWorkspaceTabId,
} from "@/features/finance/lib/finance-workspace-tabs";

type FinanceWorkspaceProps = {
  model: FinanceWorkspaceModel;
  initialTab?: FinanceWorkspaceTabId;
  canCreateQuotation?: boolean;
};

export function FinanceWorkspace({
  model,
  initialTab = DEFAULT_FINANCE_WORKSPACE_TAB,
  canCreateQuotation = false,
}: FinanceWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseFinanceWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseFinanceWorkspaceTab(tabId);
      return buildFinanceWorkspaceTabHref(model.id, tab, {
        explicitOverview: true,
      });
    },
    [model.id],
  );

  return (
    <div className="space-y-6">
      <FinanceWorkspaceHeader workspace={model} />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={FINANCE_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <FinanceWorkspaceOverview workspace={model} />
        ) : null}

        {activeTab === "transactions" ? (
          <FinanceWorkspaceTransactionsPanel records={model.records} />
        ) : null}

        {activeTab === "invoices" ? (
          <FinanceWorkspaceInvoicesPanel records={model.records} />
        ) : null}

        {activeTab === "quotations" ? (
          <FinanceWorkspaceQuotationsPanel
            records={model.records}
            canCreate={canCreateQuotation}
          />
        ) : null}

        {activeTab === "budget" ? (
          <FinanceWorkspaceBudgetPanel
            lines={model.budgetLines}
            summary={model.summary}
          />
        ) : null}

        {activeTab === "reports" ? (
          <FinanceWorkspaceReportsPanel summary={model.summary} />
        ) : null}

        {activeTab === "activity" ? (
          <FinanceWorkspaceActivityPanel activities={model.activities} />
        ) : null}
      </div>
    </div>
  );
}
