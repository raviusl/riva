import { z } from "zod";

import { companyIdSchema } from "@/core/company-isolation";
import { platformPermissionSchema } from "@/core/permission";
import { RBAC_ROLES } from "@/core/rbac/constants";

export const rbacRoleKeySchema = z.enum(RBAC_ROLES);

export type RbacRoleKeyInput = z.infer<typeof rbacRoleKeySchema>;

export const rbacRoleAssignmentSchema = z.object({
  subjectId: z.string().min(1),
  companyId: companyIdSchema,
  role: rbacRoleKeySchema,
});

export type RbacRoleAssignmentInput = z.infer<typeof rbacRoleAssignmentSchema>;

export const resolveEffectivePermissionsSchema = z.object({
  subjectId: z.string().min(1),
  companyId: companyIdSchema,
  roles: z.array(rbacRoleKeySchema).min(1),
});

export type ResolveEffectivePermissionsInput = z.infer<
  typeof resolveEffectivePermissionsSchema
>;

export const hasRolePermissionSchema = z.object({
  role: rbacRoleKeySchema,
  permission: platformPermissionSchema,
});

export type HasRolePermissionInput = z.infer<typeof hasRolePermissionSchema>;

export const hasRoleInputSchema = z.object({
  roles: z.array(z.string()),
  required: rbacRoleKeySchema,
});

export type HasRoleInput = z.infer<typeof hasRoleInputSchema>;
