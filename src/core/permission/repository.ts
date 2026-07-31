import type { PlatformPermission } from "@/core/permission/permissions";
import type { Permission, PermissionId } from "@/core/permission/types";

/**
 * Permission persistence contract — implementation deferred.
 * No database, migration, or RBAC store in Project 042.
 */
export interface PermissionRepository {
  findById(permissionId: PermissionId): Promise<Permission | null>;
  findByKey(key: PlatformPermission): Promise<Permission | null>;
  list(): Promise<Permission[]>;
  listBySubject(subjectId: string): Promise<PlatformPermission[]>;
}
