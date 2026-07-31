import { uiZh } from "@/config/ui-zh";

export const FINANCE_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "transactions", label: uiZh.transactions },
  { id: "invoices", label: uiZh.invoices },
  { id: "quotations", label: uiZh.quotations },
  { id: "budget", label: uiZh.budget },
  { id: "reports", label: uiZh.reportsTitle },
  { id: "activity", label: uiZh.activity },
] as const;

export type FinanceWorkspaceTabId =
  (typeof FINANCE_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_FINANCE_WORKSPACE_TAB: FinanceWorkspaceTabId = "overview";

export const FINANCE_WORKSPACE_HUB_ID = "workspace";

export function isFinanceWorkspaceTabId(
  value: string | null | undefined,
): value is FinanceWorkspaceTabId {
  return FINANCE_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseFinanceWorkspaceTab(
  value: string | null | undefined,
): FinanceWorkspaceTabId {
  return isFinanceWorkspaceTabId(value)
    ? value
    : DEFAULT_FINANCE_WORKSPACE_TAB;
}

export function buildFinanceWorkspaceHref(
  workspaceId: string,
  tab: FinanceWorkspaceTabId = DEFAULT_FINANCE_WORKSPACE_TAB,
): string {
  const base = `/dashboard/finance/${workspaceId}`;
  if (tab === DEFAULT_FINANCE_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildFinanceWorkspaceTabHref(
  workspaceId: string,
  tab: FinanceWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/finance/${workspaceId}`;
  if (tab === DEFAULT_FINANCE_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
