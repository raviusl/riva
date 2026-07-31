"use client";

import {
  WorkspaceHeader,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import type { FinanceWorkspaceModel } from "@/features/finance/lib/finance-types";
import { formatFinanceMoney } from "@/features/finance/lib/finance-labels";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceHeaderProps = {
  workspace: FinanceWorkspaceModel;
};

export function FinanceWorkspaceHeader({
  workspace,
}: FinanceWorkspaceHeaderProps) {
  const { summary } = workspace;
  const status: WorkspaceHeaderStatus = {
    label: formatFinanceMoney(summary.cashFlow, summary.currency),
    tone: summary.cashFlow >= 0 ? "success" : "warning",
  };

  return (
    <WorkspaceHeader
      eyebrow={uiZh.financeWorkspaceEyebrow}
      title={workspace.title}
      status={status}
      lifecycle={workspace.description}
      breadcrumbs={buildWorkspaceBreadcrumbs("finance")}
    />
  );
}
