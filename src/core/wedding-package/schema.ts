import { z } from "zod";

import {
  WEDDING_PACKAGE_CURRENCIES,
  WEDDING_PACKAGE_STATUSES,
} from "@/core/wedding-package/constants";

const packageItemInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional().nullable(),
  quantity: z.number().positive().max(1_000_000),
  unitPrice: z.number().min(0).max(100_000_000),
  unitOfMeasure: z.string().max(40).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  isIncluded: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
});

export const createWeddingPackageSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(8000).optional().nullable(),
  currency: z.enum(WEDDING_PACKAGE_CURRENCIES).optional(),
  status: z.enum(WEDDING_PACKAGE_STATUSES).optional(),
  notes: z.string().max(8000).optional().nullable(),
  sourceFinancePackageId: z.string().uuid().optional().nullable(),
  items: z.array(packageItemInputSchema).max(200).optional(),
  sequence: z.number().int().nonnegative().optional(),
});

export type CreateWeddingPackageInput = z.infer<
  typeof createWeddingPackageSchema
>;

export const updateWeddingPackageSchema = createWeddingPackageSchema.extend({
  packageId: z.string().uuid(),
});

export type UpdateWeddingPackageInput = z.infer<
  typeof updateWeddingPackageSchema
>;

export const weddingPackageIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  packageId: z.string().uuid(),
});

export type WeddingPackageIdInput = z.infer<typeof weddingPackageIdSchema>;
