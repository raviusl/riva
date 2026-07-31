/**
 * Platform Permission System — catalog + validation (Project 042).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md · docs/architecture/04_USER_PERMISSION_SYSTEM.md
 *
 * No RBAC · No company isolation · No persistence · No UI.
 */

export type {
  Permission,
  PermissionAction,
  PermissionGrant,
  PermissionId,
  PermissionKey,
  PermissionResource,
  PermissionSet,
  PlatformPermission,
} from "@/core/permission/types";

export {
  PERMISSION_ACTIONS,
  PERMISSION_RESOURCES,
} from "@/core/permission/constants";

export {
  PLATFORM_PERMISSIONS,
  PLATFORM_PERMISSION_SET,
  isPlatformPermission,
} from "@/core/permission/permissions";

export type {
  HasAllPermissionsInput,
  HasAnyPermissionInput,
  HasPermissionInput,
  PermissionGrantInput,
  PlatformPermissionInput,
} from "@/core/permission/schema";

export {
  hasAllPermissionsInputSchema,
  hasAnyPermissionInputSchema,
  hasPermissionInputSchema,
  permissionGrantSchema,
  permissionKeySchema,
  platformPermissionSchema,
} from "@/core/permission/schema";

export type { PermissionRepository } from "@/core/permission/repository";

export type { PermissionService } from "@/core/permission/service";
export {
  filterPlatformPermissions,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  validateHasAllPermissions,
  validateHasAnyPermission,
  validateHasPermission,
  validatePermissionGrant,
} from "@/core/permission/service";
