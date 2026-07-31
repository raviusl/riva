import { z } from "zod";

import { COMPANY_ISOLATION_MODES } from "@/core/company-isolation/constants";

export const companyIdSchema = z.string().uuid("companyId must be a UUID");

export const companyIsolationModeSchema = z.enum(COMPANY_ISOLATION_MODES);

export const currentCompanySchema = z.object({
  id: companyIdSchema,
  name: z.string().max(200).optional().nullable(),
});

export type CurrentCompanyInput = z.infer<typeof currentCompanySchema>;

export const companyContextSchema = z.object({
  companyId: companyIdSchema,
  workspaceId: z.string().uuid().optional().nullable(),
  actorId: z.string().uuid().optional().nullable(),
});

export type CompanyContextInput = z.infer<typeof companyContextSchema>;

export const companyScopeSchema = z.object({
  companyId: companyIdSchema,
  mode: companyIsolationModeSchema.optional().default("strict"),
});

export type CompanyScopeInput = z.infer<typeof companyScopeSchema>;

export const companyFilterSchema = z.object({
  companyId: companyIdSchema,
});

export type CompanyFilterInput = z.infer<typeof companyFilterSchema>;

export const companyScopedRecordSchema = z.object({
  companyId: companyIdSchema,
});

export type CompanyScopedRecordInput = z.infer<
  typeof companyScopedRecordSchema
>;
