/**
 * Finance domain constants (types, statuses, categories).
 */

export const FINANCE_TYPES = [
  "income",
  "expense",
  "invoice",
  "quotation",
  "payment",
  "refund",
  "budget",
  "transaction",
] as const;
export type FinanceType = (typeof FINANCE_TYPES)[number];

export const FINANCE_STATUSES = [
  "draft",
  "open",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "paid",
  "overdue",
  "void",
  "cancelled",
] as const;
export type FinanceStatus = (typeof FINANCE_STATUSES)[number];

export const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "void",
  "cancelled",
] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export const EDITABLE_QUOTATION_STATUSES: QuotationStatus[] = ["draft"];

export const FINANCE_CATEGORIES = [
  "general",
  "services",
  "products",
  "labor",
  "materials",
  "travel",
  "venue",
  "marketing",
  "fees",
  "other",
] as const;
export type FinanceCategory = (typeof FINANCE_CATEGORIES)[number];
