import {
  createFinanceSchema,
  deleteFinanceSchema,
  financeIdSchema,
  listFinanceQuerySchema,
  updateFinanceSchema,
  type CreateFinanceInput,
  type DeleteFinanceInput,
  type FinanceIdInput,
  type ListFinanceQuery,
  type UpdateFinanceInput,
} from "@/core/finance/schema";
import type { Finance } from "@/core/finance/types";

/**
 * Finance domain service contract.
 * Project 035: validation + calculation helpers — no persistence.
 */
export interface FinanceService {
  getFinance(input: FinanceIdInput): Promise<Finance>;
  listFinance(query: ListFinanceQuery): Promise<Finance[]>;
  listFinanceByWorkspace(
    companyId: string,
    workspaceId: string,
  ): Promise<Finance[]>;
  listFinanceByProject(
    companyId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<Finance[]>;
  createFinance(input: CreateFinanceInput): Promise<Finance>;
  updateFinance(input: UpdateFinanceInput): Promise<Finance>;
  deleteFinance(input: DeleteFinanceInput): Promise<void>;
}

/** Validate create input. Persistence deferred. */
export function validateCreateFinance(input: unknown): CreateFinanceInput {
  return createFinanceSchema.parse(input);
}

/** Validate update input. Persistence deferred. */
export function validateUpdateFinance(input: unknown): UpdateFinanceInput {
  return updateFinanceSchema.parse(input);
}

/** Validate list query. Persistence deferred. */
export function validateListFinanceQuery(input: unknown): ListFinanceQuery {
  return listFinanceQuerySchema.parse(input);
}

/** Validate finance id input. Persistence deferred. */
export function validateFinanceId(input: unknown): FinanceIdInput {
  return financeIdSchema.parse(input);
}

/** Validate delete input. Persistence deferred. */
export function validateDeleteFinance(input: unknown): DeleteFinanceInput {
  return deleteFinanceSchema.parse(input);
}

export type FinanceMoneyParts = {
  amount: number;
  tax?: number | null;
  discount?: number | null;
};

/**
 * Line total after tax and discount: amount − discount + tax.
 */
export function calculateTotal(parts: FinanceMoneyParts): number {
  const amount = parts.amount;
  const tax = parts.tax ?? 0;
  const discount = parts.discount ?? 0;
  return roundMoney(amount - discount + tax);
}

/**
 * Tax amount from a base amount and rate (0–1), or passthrough of an absolute tax.
 * Pass `rate` for percentage calculation; otherwise returns `tax` (default 0).
 */
export function calculateTax(
  amount: number,
  taxOrRate: number = 0,
  options?: { asRate?: boolean },
): number {
  if (options?.asRate) {
    return roundMoney(amount * taxOrRate);
  }
  return roundMoney(taxOrRate);
}

/**
 * Outstanding balance for an invoice-like record vs amounts already paid.
 * balance = total − paidAmount (floored at 0).
 */
export function calculateBalance(
  parts: FinanceMoneyParts,
  paidAmount: number = 0,
): number {
  const total = calculateTotal(parts);
  return roundMoney(Math.max(0, total - paidAmount));
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
