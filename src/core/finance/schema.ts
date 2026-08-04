import { z } from "zod";

import {
  FINANCE_CATEGORIES,
  FINANCE_STATUSES,
  FINANCE_TYPES,
  QUOTATION_STATUSES,
} from "@/core/finance/constants";
import {
  financeLineItemKindSchema,
  quotationDocumentContentSchema,
} from "@/core/finance/document-content";

export const financeTypeSchema = z.enum(FINANCE_TYPES);
export const financeStatusSchema = z.enum(FINANCE_STATUSES);
export const financeCategorySchema = z.enum(FINANCE_CATEGORIES);
export const quotationStatusSchema = z.enum(QUOTATION_STATUSES);

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

export const quotationIdSchema = z.object({
  quotationId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
});

export type QuotationIdInput = z.infer<typeof quotationIdSchema>;

export const financeLineItemInputSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().finite().positive().default(1),
  unitPrice: moneySchema.default(0),
  tax: moneySchema.optional().default(0),
  discount: moneySchema.optional().default(0),
  itemKind: financeLineItemKindSchema.optional(),
  unitOfMeasure: z.string().max(40).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export type FinanceLineItemInput = z.infer<typeof financeLineItemInputSchema>;

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
  notes: z.string().max(8000).optional().nullable(),
  internalNotes: z.string().max(8000).optional().nullable(),
  documentContent: quotationDocumentContentSchema.optional(),
  createdBy: z.string().uuid(),
});

export type CreateFinanceInput = z.infer<typeof createFinanceSchema>;

export const createQuotationSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  category: financeCategorySchema.optional().default("general"),
  currency: currencySchema.optional().default("USD"),
  referenceNumber: z.string().max(100).optional().nullable(),
  issuedAt: z.string().min(1).max(64).optional().nullable(),
  dueAt: z.string().min(1).max(64).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  internalNotes: z.string().max(8000).optional().nullable(),
  documentContent: quotationDocumentContentSchema.optional(),
  lineItems: z.array(financeLineItemInputSchema).min(1).max(200),
  createdBy: z.string().uuid(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

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
  notes: z.string().max(8000).optional().nullable(),
  internalNotes: z.string().max(8000).optional().nullable(),
  documentContent: quotationDocumentContentSchema.optional(),
  updatedBy: z.string().uuid(),
});

export type UpdateFinanceInput = z.infer<typeof updateFinanceSchema>;

export const updateQuotationSchema = z.object({
  quotationId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  category: financeCategorySchema.optional(),
  currency: currencySchema.optional(),
  referenceNumber: z.string().max(100).optional().nullable(),
  issuedAt: z.string().min(1).max(64).optional().nullable(),
  dueAt: z.string().min(1).max(64).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  internalNotes: z.string().max(8000).optional().nullable(),
  documentContent: quotationDocumentContentSchema.optional(),
  lineItems: z.array(financeLineItemInputSchema).min(1).max(200).optional(),
  updatedBy: z.string().uuid(),
});

export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;

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

export const listQuotationsQuerySchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  status: quotationStatusSchema.optional(),
});

export type ListQuotationsQuery = z.infer<typeof listQuotationsQuerySchema>;

export const deleteFinanceSchema = z.object({
  financeId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteFinanceInput = z.infer<typeof deleteFinanceSchema>;

export const transitionQuotationSchema = quotationIdSchema.extend({
  note: z.string().max(2000).optional().nullable(),
});

export type TransitionQuotationInput = z.infer<
  typeof transitionQuotationSchema
>;

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
  convertedInvoiceId: z.string().uuid().nullable(),
  notes: z.string().max(8000).nullable(),
  internalNotes: z.string().max(8000).nullable(),
  documentContent: quotationDocumentContentSchema.optional(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
