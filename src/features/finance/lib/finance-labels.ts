import type { FinanceStatus, FinanceType } from "@/core/finance";
import { uiZh } from "@/config/ui-zh";
import type { QuotationDisplayStatus } from "@/features/finance/lib/finance-types";

export function formatFinanceMoney(
  amount: number,
  currency: string = "USD",
): string {
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatFinanceDate(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function financeTypeLabel(type: FinanceType): string {
  switch (type) {
    case "income":
      return uiZh.revenue;
    case "expense":
      return uiZh.expense;
    case "invoice":
      return uiZh.invoiceFallback;
    case "quotation":
      return uiZh.quotationFallback;
    case "payment":
      return uiZh.paymentType;
    case "refund":
      return uiZh.refund;
    case "budget":
      return uiZh.budget;
    case "transaction":
      return uiZh.transactions;
    default:
      return type;
  }
}

export function financeCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    services: uiZh.categoryServices,
    venue: uiZh.categoryVenue,
    materials: uiZh.categoryMaterials,
    marketing: uiZh.categoryMarketing,
    fees: uiZh.categoryFees,
    general: uiZh.categoryGeneral,
    products: uiZh.categoryProducts,
    Services: uiZh.categoryServices,
    Venue: uiZh.categoryVenue,
    Materials: uiZh.categoryMaterials,
    Marketing: uiZh.categoryMarketing,
    Fees: uiZh.categoryFees,
    场地: uiZh.categoryVenue,
    服务: uiZh.categoryServices,
    物料: uiZh.categoryMaterials,
    营销: uiZh.categoryMarketing,
    费用: uiZh.categoryFees,
  };
  return map[category] ?? category;
}

/** Invoice UI statuses */
export function invoiceStatusLabel(status: FinanceStatus): string {
  switch (status) {
    case "draft":
      return uiZh.draft;
    case "open":
      return uiZh.sent;
    case "paid":
      return uiZh.paid;
    case "overdue":
      return uiZh.overdue;
    case "cancelled":
    case "void":
      return uiZh.cancelled;
  }
}

export function quotationStatusLabel(status: QuotationDisplayStatus): string {
  switch (status) {
    case "draft":
      return uiZh.draft;
    case "sent":
      return uiZh.sent;
    case "accepted":
      return uiZh.decisionAccepted;
    case "rejected":
      return uiZh.decisionRejected;
    case "expired":
      return uiZh.inviteStatusExpired;
    default:
      return status;
  }
}

export function financeStatusLabel(status: FinanceStatus): string {
  return invoiceStatusLabel(status);
}

export function budgetProgressPercent(budget: number, actual: number): number {
  if (budget <= 0) return 0;
  return Math.min(100, Math.round((actual / budget) * 100));
}
