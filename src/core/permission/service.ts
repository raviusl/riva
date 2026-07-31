import {
  hasAllPermissionsInputSchema,
  hasAnyPermissionInputSchema,
  hasPermissionInputSchema,
  permissionGrantSchema,
  type HasAllPermissionsInput,
  type HasAnyPermissionInput,
  type HasPermissionInput,
  type PermissionGrantInput,
} from "@/core/permission/schema";
import type { PlatformPermission } from "@/core/permission/permissions";
import { isPlatformPermission } from "@/core/permission/permissions";
import type { Permission } from "@/core/permission/types";

/**
 * Permission domain service contract.
 * Project 042: validation helpers only — no RBAC evaluation engine.
 */
export interface PermissionService {
  listPermissions(): Promise<Permission[]>;
  getPermissionsForSubject(subjectId: string): Promise<PlatformPermission[]>;
  hasPermission(
    permissions: readonly string[],
    required: PlatformPermission,
  ): boolean;
  hasAnyPermission(
    permissions: readonly string[],
    required: readonly PlatformPermission[],
  ): boolean;
  hasAllPermissions(
    permissions: readonly string[],
    required: readonly PlatformPermission[],
  ): boolean;
}

/** True when the grant set includes the required permission key. */
export function hasPermission(
  permissions: readonly string[],
  required: PlatformPermission,
): boolean {
  return permissions.includes(required);
}

/** True when the grant set includes at least one required permission. */
export function hasAnyPermission(
  permissions: readonly string[],
  required: readonly PlatformPermission[],
): boolean {
  return required.some((permission) => permissions.includes(permission));
}

/** True when the grant set includes every required permission. */
export function hasAllPermissions(
  permissions: readonly string[],
  required: readonly PlatformPermission[],
): boolean {
  return required.every((permission) => permissions.includes(permission));
}

/** Validate hasPermission input shape. */
export function validateHasPermission(input: unknown): HasPermissionInput {
  return hasPermissionInputSchema.parse(input);
}

/** Validate hasAnyPermission input shape. */
export function validateHasAnyPermission(
  input: unknown,
): HasAnyPermissionInput {
  return hasAnyPermissionInputSchema.parse(input);
}

/** Validate hasAllPermissions input shape. */
export function validateHasAllPermissions(
  input: unknown,
): HasAllPermissionsInput {
  return hasAllPermissionsInputSchema.parse(input);
}

/** Validate a permission grant payload. */
export function validatePermissionGrant(input: unknown): PermissionGrantInput {
  return permissionGrantSchema.parse(input);
}

/** Filter unknown strings down to known platform permissions. */
export function filterPlatformPermissions(
  permissions: readonly string[],
): PlatformPermission[] {
  return permissions.filter(isPlatformPermission);
}
