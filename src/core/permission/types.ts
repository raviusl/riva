/**
 * Shared Permission domain types — platform foundation (Project 042).
 */

import type {
  PermissionAction,
  PermissionResource,
} from "@/core/permission/constants";
import type { PlatformPermission } from "@/core/permission/permissions";

export type {
  PermissionAction,
  PermissionResource,
} from "@/core/permission/constants";

export type {
  PermissionKey,
  PlatformPermission,
} from "@/core/permission/permissions";

export type PermissionId = string;

/**
 * Permission definition (catalog entry).
 * Persistence and role bindings are deferred.
 */
export type Permission = {
  id: PermissionId;
  key: PlatformPermission;
  resource: PermissionResource;
  action: PermissionAction | string;
  description: string | null;
};

/** A subject's granted permission keys (in-memory / future membership projection). */
export type PermissionGrant = {
  subjectId: string;
  permissions: readonly PlatformPermission[];
};

export type PermissionSet = ReadonlySet<PlatformPermission>;
