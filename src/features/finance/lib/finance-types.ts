import type { Finance } from "@/core/finance";

/** Quotation lifecycle labels for Workspace UI (preview — not domain statuses). */
export const QUOTATION_DISPLAY_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
] as const;
export type QuotationDisplayStatus =
  (typeof QUOTATION_DISPLAY_STATUSES)[number];

export type FinanceWorkspaceItem = Finance & {
  projectName: string | null;
  clientName: string | null;
  vendorName: string | null;
  /** UI-only quotation status for the Quotations tab. */
  quotationStatus?: QuotationDisplayStatus;
};

export type FinanceBudgetLine = {
  id: string;
  category: string;
  budget: number;
  actual: number;
  currency: string;
};

export type FinanceActivityItem = {
  id: string;
  actorLabel: string | null;
  message: string;
  createdAt: string;
};

export type FinanceWorkspaceSummary = {
  totalIncome: number;
  totalExpenses: number;
  outstandingInvoices: number;
  outstandingPayments: number;
  budgetTotal: number;
  budgetActual: number;
  budgetRemaining: number;
  cashIn: number;
  cashOut: number;
  cashFlow: number;
  revenue: number;
  expense: number;
  profit: number;
  tax: number;
  currency: string;
};

/** Hub model for the Finance Workspace (preview until persistence). */
export type FinanceWorkspaceModel = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  workspaceId: string;
  summary: FinanceWorkspaceSummary;
  records: FinanceWorkspaceItem[];
  budgetLines: FinanceBudgetLine[];
  activities: FinanceActivityItem[];
};
