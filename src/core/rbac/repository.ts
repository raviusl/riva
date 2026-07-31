import type { CompanyId } from "@/core/company-isolation";
import type { PlatformPermission } from "@/core/permission";
import type { RbacRoleKey } from "@/core/rbac/constants";
import type {
  EffectivePermissions,
  RbacRoleAssignment,
  RbacRoleDefinition,
} from "@/core/rbac/types";

/**
 * RBAC persistence contract — implementation deferred.
 * No database changes or migrations in Project 044.
 */
export interface RBACRepository {
  listRoles(): Promise<RbacRoleDefinition[]>;
  getRole(role: RbacRoleKey): Promise<RbacRoleDefinition | null>;
  getRolePermissions(role: RbacRoleKey): Promise<PlatformPermission[]>;
  listAssignments(
    companyId: CompanyId,
    subjectId: string,
  ): Promise<RbacRoleAssignment[]>;
  resolveEffectivePermissions(
    companyId: CompanyId,
    subjectId: string,
  ): Promise<EffectivePermissions>;
}
