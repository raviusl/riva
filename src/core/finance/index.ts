/**
 * Finance domain foundation — contracts + quotation engine (Project 035 / 089).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 *
 * Server persistence (repository / quotation façade / activity) is imported
 * from dedicated modules — do not re-export server-only code here.
 */

export type {
  Budget,
  Expense,
  Finance,
  FinanceCategory,
  FinanceId,
  FinanceLineItem,
  FinanceModel,
  FinanceStatus,
  FinanceType,
  Income,
  Invoice,
  Payment,
  Quotation,
  QuotationStatus,
  QuotationWithLines,
  Refund,
  Transaction,
} from "@/core/finance/types";

export {
  EDITABLE_QUOTATION_STATUSES,
  FINANCE_CATEGORIES,
  FINANCE_STATUSES,
  FINANCE_TYPES,
  QUOTATION_STATUSES,
} from "@/core/finance/constants";

export type {
  CreateFinanceInput,
  CreateQuotationInput,
  DeleteFinanceInput,
  FinanceIdInput,
  FinanceLineItemInput,
  ListFinanceQuery,
  ListQuotationsQuery,
  QuotationIdInput,
  TransitionQuotationInput,
  UpdateFinanceInput,
  UpdateQuotationInput,
} from "@/core/finance/schema";

export {
  createFinanceSchema,
  createQuotationSchema,
  deleteFinanceSchema,
  financeCategorySchema,
  financeIdSchema,
  financeLineItemInputSchema,
  financeSchema,
  financeStatusSchema,
  financeTypeSchema,
  listFinanceQuerySchema,
  listQuotationsQuerySchema,
  quotationIdSchema,
  quotationStatusSchema,
  transitionQuotationSchema,
  updateFinanceSchema,
  updateQuotationSchema,
} from "@/core/finance/schema";

export type {
  FinanceMoneyParts,
  FinanceService,
} from "@/core/finance/service";
export {
  calculateBalance,
  calculateTax,
  calculateTotal,
  validateCreateFinance,
  validateDeleteFinance,
  validateFinanceId,
  validateListFinanceQuery,
  validateUpdateFinance,
} from "@/core/finance/service";

export type { FinancePermission } from "@/core/finance/permissions";
export { FINANCE_PERMISSIONS } from "@/core/finance/permissions";

export type { FinanceDomainEvent, FinanceEventName } from "@/core/finance/events";
export { FINANCE_EVENTS, buildFinanceEvent } from "@/core/finance/events";

export type {
  FinanceActivity,
  FinanceActivityType,
} from "@/core/finance/activity-types";
export { FINANCE_ACTIVITY_TYPES } from "@/core/finance/activity-types";
