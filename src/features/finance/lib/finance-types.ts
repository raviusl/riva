import type { Finance } from "@/core/finance";
import type { QuotationStatus } from "@/core/finance/constants";

/** @deprecated Use QuotationStatus from core — kept as alias for UI imports. */
export type QuotationDisplayStatus = QuotationStatus;

export const QUOTATION_DISPLAY_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "void",
  "cancelled",
] as const;

export type FinanceWorkspaceItem = Finance & {
  projectName: string | null;
  clientName: string | null;
  vendorName: string | null;
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
