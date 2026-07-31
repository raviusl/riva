/**
 * Finance domain foundation — contracts + validation (Project 035).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 *
 * No UI · No Workspace · No payments provider · No server actions.
 */

export type {
  Budget,
  Expense,
  Finance,
  FinanceCategory,
  FinanceId,
  FinanceModel,
  FinanceStatus,
  FinanceType,
  Income,
  Invoice,
  Payment,
  Quotation,
  Refund,
  Transaction,
} from "@/core/finance/types";

export {
  FINANCE_CATEGORIES,
  FINANCE_STATUSES,
  FINANCE_TYPES,
} from "@/core/finance/constants";

export type {
  CreateFinanceInput,
  DeleteFinanceInput,
  FinanceIdInput,
  ListFinanceQuery,
  UpdateFinanceInput,
} from "@/core/finance/schema";

export {
  createFinanceSchema,
  deleteFinanceSchema,
  financeCategorySchema,
  financeIdSchema,
  financeSchema,
  financeStatusSchema,
  financeTypeSchema,
  listFinanceQuerySchema,
  updateFinanceSchema,
} from "@/core/finance/schema";

export type { FinanceRepository } from "@/core/finance/repository";

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
export { FINANCE_EVENTS } from "@/core/finance/events";
