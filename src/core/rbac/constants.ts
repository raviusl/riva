/**
 * RBAC constants (Project 044).
 */

export const RBAC_ROLES = [
  "owner",
  "admin",
  "manager",
  "coordinator",
  "sales",
  "viewer",
] as const;

export type RbacRoleKey = (typeof RBAC_ROLES)[number];

export const RBAC_ROLE_LABELS: Record<RbacRoleKey, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  coordinator: "Coordinator",
  sales: "Sales",
  viewer: "Viewer",
};
