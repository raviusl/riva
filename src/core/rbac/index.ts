/**
 * Platform RBAC layer — roles ↔ Permission System (Project 044).
 * Uses Company Isolation for company-scoped grants.
 *
 * No persistence · No auth changes · No UI / Workspace redesign.
 */

export type {
  EffectivePermissions,
  RbacRoleAssignment,
  RbacRoleDefinition,
  RbacRoleId,
  RbacRoleKey,
} from "@/core/rbac/types";

export {
  RBAC_ROLES,
  RBAC_ROLE_LABELS,
} from "@/core/rbac/constants";

export type {
  HasRoleInput,
  HasRolePermissionInput,
  RbacRoleAssignmentInput,
  RbacRoleKeyInput,
  ResolveEffectivePermissionsInput,
} from "@/core/rbac/schema";

export {
  hasRoleInputSchema,
  hasRolePermissionSchema,
  rbacRoleAssignmentSchema,
  rbacRoleKeySchema,
  resolveEffectivePermissionsSchema,
} from "@/core/rbac/schema";

export {
  DEFAULT_RBAC_ROLES,
  getDefaultRolePermissions,
  getRbacRoleDefinition,
  isRbacRoleKey,
  listDefaultRbacRoles,
} from "@/core/rbac/roles";

export type { RBACRepository } from "@/core/rbac/repository";

export type { RBACService } from "@/core/rbac/service";
export {
  canManageCompany,
  canManageWorkspace,
  getRolePermissions,
  hasRole,
  hasRolePermission,
  isAdmin,
  isOwner,
  listRbacRoles,
  resolveEffectivePermissions,
  roleHasAllPermissions,
  roleHasAnyPermission,
  validateHasRole,
  validateHasRolePermission,
  validateRbacRoleAssignment,
  validateRbacRoleKey,
  validateResolveEffectivePermissions,
} from "@/core/rbac/service";
