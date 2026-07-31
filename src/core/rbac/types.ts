/**
 * Shared RBAC types — platform foundation (Project 044).
 * Connects default Roles to the Permission System (042).
 * Company Isolation (043) scopes role grants; auth is unchanged.
 */

import type { CompanyId } from "@/core/company-isolation";
import type { PlatformPermission } from "@/core/permission";
import type { RbacRoleKey } from "@/core/rbac/constants";

export type { RbacRoleKey } from "@/core/rbac/constants";

export type RbacRoleId = string;

export type RbacRoleDefinition = {
  key: RbacRoleKey;
  label: string;
  description: string;
  permissions: readonly PlatformPermission[];
};

/**
 * Role grant within a company boundary.
 * Persistence deferred — companyId prepares isolation without auth changes.
 */
export type RbacRoleAssignment = {
  subjectId: string;
  companyId: CompanyId;
  role: RbacRoleKey;
};

export type EffectivePermissions = {
  subjectId: string;
  companyId: CompanyId;
  roles: readonly RbacRoleKey[];
  permissions: readonly PlatformPermission[];
};
