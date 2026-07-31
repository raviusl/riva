import { z } from "zod";

import {
  FINANCE_CATEGORIES,
  FINANCE_STATUSES,
  FINANCE_TYPES,
} from "@/core/finance/constants";

export const financeTypeSchema = z.enum(FINANCE_TYPES);
export const financeStatusSchema = z.enum(FINANCE_STATUSES);
export const financeCategorySchema = z.enum(FINANCE_CATEGORIES);

const moneySchema = z.number().finite().nonnegative();
const currencySchema = z
  .string()
  .min(3)
  .max(3)
  .transform((value) => value.toUpperCase());

export const financeIdSchema = z.object({
  financeId: z.string().uuid(),
});

export type FinanceIdInput = z.infer<typeof financeIdSchema>;

export const createFinanceSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  type: financeTypeSchema,
  category: financeCategorySchema.optional().default("general"),
  currency: currencySchema.optional().default("USD"),
  amount: moneySchema,
  tax: moneySchema.optional().default(0),
  discount: moneySchema.optional().default(0),
  status: financeStatusSchema.optional().default("draft"),
  referenceNumber: z.string().max(100).optional().nullable(),
  issuedAt: z.string().min(1).max(64).optional().nullable(),
  dueAt: z.string().min(1).max(64).optional().nullable(),
  paidAt: z.string().min(1).max(64).optional().nullable(),
  createdBy: z.string().uuid(),
});

export type CreateFinanceInput = z.infer<typeof createFinanceSchema>;

export const updateFinanceSchema = z.object({
  financeId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  type: financeTypeSchema.optional(),
  category: financeCategorySchema.optional(),
  currency: currencySchema.optional(),
  amount: moneySchema.optional(),
  tax: moneySchema.optional(),
  discount: moneySchema.optional(),
  status: financeStatusSchema.optional(),
  referenceNumber: z.string().max(100).optional().nullable(),
  issuedAt: z.string().min(1).max(64).optional().nullable(),
  dueAt: z.string().min(1).max(64).optional().nullable(),
  paidAt: z.string().min(1).max(64).optional().nullable(),
  updatedBy: z.string().uuid(),
});

export type UpdateFinanceInput = z.infer<typeof updateFinanceSchema>;

export const listFinanceQuerySchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  type: financeTypeSchema.optional(),
  category: financeCategorySchema.optional(),
  status: financeStatusSchema.optional(),
});

export type ListFinanceQuery = z.infer<typeof listFinanceQuerySchema>;

export const deleteFinanceSchema = z.object({
  financeId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteFinanceInput = z.infer<typeof deleteFinanceSchema>;

/** Full Finance shape validation (read model). */
export const financeSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().nullable(),
  clientId: z.string().uuid().nullable(),
  vendorId: z.string().uuid().nullable(),
  type: financeTypeSchema,
  category: financeCategorySchema,
  currency: z.string().min(3).max(3),
  amount: moneySchema,
  tax: moneySchema,
  discount: moneySchema,
  status: financeStatusSchema,
  referenceNumber: z.string().max(100).nullable(),
  issuedAt: z.string().min(1).max(64).nullable(),
  dueAt: z.string().min(1).max(64).nullable(),
  paidAt: z.string().min(1).max(64).nullable(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
