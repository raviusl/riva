import { requireCompany } from "@/core/company-isolation";
import type { CompanyId } from "@/core/company-isolation";
import {
  filterPlatformPermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type PlatformPermission,
} from "@/core/permission";
import {
  getDefaultRolePermissions,
  isRbacRoleKey,
  listDefaultRbacRoles,
} from "@/core/rbac/roles";
import {
  hasRoleInputSchema,
  hasRolePermissionSchema,
  resolveEffectivePermissionsSchema,
  rbacRoleAssignmentSchema,
  rbacRoleKeySchema,
  type HasRoleInput,
  type HasRolePermissionInput,
  type RbacRoleAssignmentInput,
  type ResolveEffectivePermissionsInput,
} from "@/core/rbac/schema";
import type { RbacRoleKey } from "@/core/rbac/constants";
import type {
  EffectivePermissions,
  RbacRoleDefinition,
} from "@/core/rbac/types";

/**
 * RBAC service contract.
 * Project 044: role catalog + permission helpers only — no auth / UI changes.
 */
export interface RBACService {
  listRoles(): Promise<RbacRoleDefinition[]>;
  getRolePermissions(role: RbacRoleKey): Promise<readonly PlatformPermission[]>;
  hasRolePermission(
    role: RbacRoleKey,
    permission: PlatformPermission,
  ): boolean;
  resolveEffectivePermissions(
    subjectId: string,
    companyId: CompanyId,
    roles: readonly RbacRoleKey[],
  ): EffectivePermissions;
  hasRole(roles: readonly string[], required: RbacRoleKey): boolean;
  isOwner(roles: readonly string[]): boolean;
  isAdmin(roles: readonly string[]): boolean;
  canManageWorkspace(permissions: readonly string[]): boolean;
  canManageCompany(permissions: readonly string[]): boolean;
}

/** Permissions owned by a default role. */
export function getRolePermissions(
  role: RbacRoleKey,
): readonly PlatformPermission[] {
  return getDefaultRolePermissions(role);
}

/** True when the role catalog includes the permission. */
export function hasRolePermission(
  role: RbacRoleKey,
  permission: PlatformPermission,
): boolean {
  return hasPermission(getRolePermissions(role), permission);
}

/**
 * Union permissions for one or more roles within a company scope.
 * Uses Permission System helpers; companyId is required for isolation readiness.
 */
export function resolveEffectivePermissions(
  subjectId: string,
  companyId: string,
  roles: readonly RbacRoleKey[],
): EffectivePermissions {
  const scopedCompanyId = requireCompany(companyId);
  const uniqueRoles = [...new Set(roles)];
  const merged = new Set<PlatformPermission>();

  for (const role of uniqueRoles) {
    for (const permission of getRolePermissions(role)) {
      merged.add(permission);
    }
  }

  return {
    subjectId,
    companyId: scopedCompanyId,
    roles: uniqueRoles,
    permissions: [...merged],
  };
}

/** True when the role list includes the required role. */
export function hasRole(
  roles: readonly string[],
  required: RbacRoleKey,
): boolean {
  return roles.includes(required);
}

export function isOwner(roles: readonly string[]): boolean {
  return hasRole(roles, "owner");
}

export function isAdmin(roles: readonly string[]): boolean {
  return hasRole(roles, "admin") || isOwner(roles);
}

export function canManageWorkspace(permissions: readonly string[]): boolean {
  return hasPermission(
    filterPlatformPermissions(permissions),
    "workspace.manage",
  );
}

export function canManageCompany(permissions: readonly string[]): boolean {
  return hasPermission(
    filterPlatformPermissions(permissions),
    "company.manage",
  );
}

/** True when effective permissions include every required key. */
export function roleHasAllPermissions(
  role: RbacRoleKey,
  required: readonly PlatformPermission[],
): boolean {
  return hasAllPermissions(getRolePermissions(role), required);
}

/** True when effective permissions include any required key. */
export function roleHasAnyPermission(
  role: RbacRoleKey,
  required: readonly PlatformPermission[],
): boolean {
  return hasAnyPermission(getRolePermissions(role), required);
}

export function validateRbacRoleKey(input: unknown): RbacRoleKey {
  return rbacRoleKeySchema.parse(input);
}

export function validateRbacRoleAssignment(
  input: unknown,
): RbacRoleAssignmentInput {
  return rbacRoleAssignmentSchema.parse(input);
}

export function validateResolveEffectivePermissions(
  input: unknown,
): ResolveEffectivePermissionsInput {
  return resolveEffectivePermissionsSchema.parse(input);
}

export function validateHasRolePermission(
  input: unknown,
): HasRolePermissionInput {
  return hasRolePermissionSchema.parse(input);
}

export function validateHasRole(input: unknown): HasRoleInput {
  return hasRoleInputSchema.parse(input);
}

export function listRbacRoles(): readonly RbacRoleDefinition[] {
  return listDefaultRbacRoles();
}

export { isRbacRoleKey };
