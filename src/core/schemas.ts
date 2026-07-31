import { z } from "zod";

import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  COMPANY_TYPES,
  CORE_ROLES,
  MEMBERSHIP_ROLES,
  MEMBERSHIP_STATUSES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  VENDOR_CATEGORIES,
  VENDOR_STATUSES,
  WORKSPACE_STATUSES,
} from "@/core/types";

const slugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

const countrySchema = z
  .string()
  .length(2)
  .regex(/^[A-Za-z]{2}$/, "Country must be a 2-letter ISO code")
  .optional()
  .nullable();

const logoUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "Logo URL must start with http:// or https://",
  })
  .optional()
  .nullable();

const currencySchema = z
  .string()
  .length(3)
  .regex(/^[A-Za-z]{3}$/, "Currency must be a 3-letter code");

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(120),
  slug: slugSchema.optional(),
  timezone: z.string().min(1).max(64).optional(),
  locale: z.string().min(2).max(16).optional(),
  currency: currencySchema.optional(),
  country: countrySchema,
  logoUrl: logoUrlSchema,
  status: z.enum(["pending", "active"]).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSettingsSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Workspace name is required").max(120),
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: currencySchema,
  country: countrySchema,
  logoUrl: logoUrlSchema,
});

export type UpdateWorkspaceSettingsInput = z.infer<
  typeof updateWorkspaceSettingsSchema
>;

export const workspaceIdSchema = z.object({
  workspaceId: z.string().uuid(),
});

export type WorkspaceIdInput = z.infer<typeof workspaceIdSchema>;

export const switchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid(),
});

export type SwitchWorkspaceInput = z.infer<typeof switchWorkspaceSchema>;

export const switchCompanySchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
});

export type SwitchCompanyInput = z.infer<typeof switchCompanySchema>;

export const createCompanySchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(64).optional(),
  type: z.enum(COMPANY_TYPES).optional().nullable(),
  logoUrl: logoUrlSchema,
  country: z.string().min(2).max(2).optional(),
  timezone: z.string().min(1).max(64).optional(),
  locale: z.string().min(2).max(16).optional(),
  currency: z.string().length(3).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySettingsSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string().min(1, "Company name is required").max(160),
  type: z.enum(COMPANY_TYPES).optional().nullable(),
  logoUrl: logoUrlSchema,
  country: countrySchema,
  timezone: z.string().min(1).max(64).optional().nullable(),
  locale: z.string().min(2).max(16).optional().nullable(),
  currency: currencySchema.optional().nullable(),
});

export type UpdateCompanySettingsInput = z.infer<
  typeof updateCompanySettingsSchema
>;

export const companyIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
});

export type CompanyIdInput = z.infer<typeof companyIdSchema>;

export const createPersonSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  fullName: z.string().min(1).max(160),
  role: z.enum(CORE_ROLES),
  userId: z.string().uuid().nullable().optional(),
  status: z.enum(MEMBERSHIP_STATUSES).optional(),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string().min(1).max(160),
  description: z.string().max(4000).optional().nullable(),
  projectType: z.enum(PROJECT_TYPES).nullable().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  clientId: z.string().uuid().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1).max(160),
  description: z.string().max(4000).optional().nullable(),
  projectType: z.enum(PROJECT_TYPES).nullable().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional()
    .nullable(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
});

export type ProjectIdInput = z.infer<typeof projectIdSchema>;

export const createClientSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(160),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  clientType: z.enum(CLIENT_TYPES).nullable().optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
  followUpAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Follow-up date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  clientId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(160),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  clientType: z.enum(CLIENT_TYPES).nullable().optional(),
  status: z.enum(CLIENT_STATUSES).optional(),
  followUpAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Follow-up date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const clientIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  clientId: z.string().uuid(),
});

export type ClientIdInput = z.infer<typeof clientIdSchema>;

export const createVendorSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(160),
  companyName: z.string().max(160).optional().nullable(),
  contactPerson: z.string().max(160).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  category: z.enum(VENDOR_CATEGORIES).nullable().optional(),
  status: z.enum(VENDOR_STATUSES).optional(),
  notes: z.string().max(4000).optional().nullable(),
});

export type CreateVendorInput = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  vendorId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  ownerId: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(160),
  companyName: z.string().max(160).optional().nullable(),
  contactPerson: z.string().max(160).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  category: z.enum(VENDOR_CATEGORIES).nullable().optional(),
  status: z.enum(VENDOR_STATUSES).optional(),
  notes: z.string().max(4000).optional().nullable(),
});

export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

export const vendorIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  vendorId: z.string().uuid(),
});

export type VendorIdInput = z.infer<typeof vendorIdSchema>;

export const invitePersonSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  fullName: z.string().min(1).max(160),
  role: z.enum(MEMBERSHIP_ROLES),
});

export type InvitePersonInput = z.infer<typeof invitePersonSchema>;

export const acceptCoreInvitationSchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AcceptCoreInvitationInput = z.infer<
  typeof acceptCoreInvitationSchema
>;

export const rejectCoreInvitationSchema = z.object({
  token: z.string().min(20),
});

export type RejectCoreInvitationInput = z.infer<
  typeof rejectCoreInvitationSchema
>;

export const setMembershipRoleSchema = z.object({
  workspaceId: z.string().uuid(),
  personId: z.string().uuid(),
  role: z.enum(MEMBERSHIP_ROLES),
});

export type SetMembershipRoleInput = z.infer<typeof setMembershipRoleSchema>;

export const membershipPersonSchema = z.object({
  workspaceId: z.string().uuid(),
  personId: z.string().uuid(),
});

export type MembershipPersonInput = z.infer<typeof membershipPersonSchema>;

export const workspaceStatusSchema = z.enum(WORKSPACE_STATUSES);
