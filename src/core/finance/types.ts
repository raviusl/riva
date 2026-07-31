/**
 * Shared Finance domain types — platform foundation (Project 035).
 */

import type {
  FinanceCategory,
  FinanceStatus,
  FinanceType,
} from "@/core/finance/constants";

export type {
  FinanceCategory,
  FinanceStatus,
  FinanceType,
} from "@/core/finance/constants";

export type FinanceId = string;

/**
 * Core Finance entity shared across Project, Client, Vendor, and company workspaces.
 * Persistence and payments providers are deferred.
 */
export type Finance = {
  id: FinanceId;
  companyId: string;
  workspaceId: string;
  projectId: string | null;
  clientId: string | null;
  vendorId: string | null;
  type: FinanceType;
  category: FinanceCategory;
  currency: string;
  amount: number;
  tax: number;
  discount: number;
  status: FinanceStatus;
  referenceNumber: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceModel = Finance;

export type Income = Finance & { type: "income" };
export type Expense = Finance & { type: "expense" };
export type Invoice = Finance & { type: "invoice" };
export type Quotation = Finance & { type: "quotation" };
export type Payment = Finance & { type: "payment" };
export type Refund = Finance & { type: "refund" };
export type Budget = Finance & { type: "budget" };
export type Transaction = Finance & { type: "transaction" };
