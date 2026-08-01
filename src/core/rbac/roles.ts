/**
 * Default RBAC role → platform permission mapping (Project 044).
 * Catalog only — no persistence / enforcement engine.
 */

import type { PlatformPermission } from "@/core/permission";
import { PLATFORM_PERMISSIONS } from "@/core/permission";
import {
  RBAC_ROLE_LABELS,
  RBAC_ROLES,
  type RbacRoleKey,
} from "@/core/rbac/constants";
import type { RbacRoleDefinition } from "@/core/rbac/types";

const ALL_PERMISSIONS: readonly PlatformPermission[] = PLATFORM_PERMISSIONS;

const READ_PERMISSIONS = PLATFORM_PERMISSIONS.filter((key) =>
  key.endsWith(".read"),
) as PlatformPermission[];

const MANAGER_PERMISSIONS: readonly PlatformPermission[] = [
  "project.read",
  "project.write",
  "project.delete",
  "client.read",
  "client.write",
  "client.delete",
  "vendor.read",
  "vendor.write",
  "vendor.delete",
  "meeting.read",
  "meeting.write",
  "meeting.delete",
  "task.read",
  "task.write",
  "task.assign",
  "task.delete",
  "timeline.read",
  "timeline.write",
  "document.read",
  "document.write",
  "document.delete",
  "finance.read",
  "finance.write",
  "finance.approve",
  "finance.export",
  "notification.read",
  "notification.write",
  "automation.read",
  "automation.write",
  "automation.manage",
  "workspace.manage",
];

const COORDINATOR_PERMISSIONS: readonly PlatformPermission[] = [
  "project.read",
  "project.write",
  "client.read",
  "client.write",
  "vendor.read",
  "vendor.write",
  "meeting.read",
  "meeting.write",
  "task.read",
  "task.write",
  "task.assign",
  "timeline.read",
  "timeline.write",
  "document.read",
  "document.write",
  "finance.read",
  "finance.write",
  "notification.read",
  "notification.write",
  "automation.read",
];

const SALES_PERMISSIONS: readonly PlatformPermission[] = [
  "project.read",
  "project.write",
  "client.read",
  "client.write",
  "vendor.read",
  "meeting.read",
  "meeting.write",
  "task.read",
  "task.write",
  "timeline.read",
  "document.read",
  "finance.read",
  "finance.write",
  "notification.read",
  "notification.write",
];

const ROLE_DESCRIPTIONS: Record<RbacRoleKey, string> = {
  owner: "Full control of the company and workspace",
  admin: "Administer company operations and settings",
  manager: "Manage delivery modules across the company",
  coordinator: "Coordinate projects, tasks, meetings, and vendors",
  sales: "Manage clients and early project / meeting context",
  viewer: "Read-only access across company modules",
};

const ROLE_PERMISSION_MAP: Record<
  RbacRoleKey,
  readonly PlatformPermission[]
> = {
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  manager: MANAGER_PERMISSIONS,
  coordinator: COORDINATOR_PERMISSIONS,
  sales: SALES_PERMISSIONS,
  viewer: READ_PERMISSIONS,
};

export const DEFAULT_RBAC_ROLES: readonly RbacRoleDefinition[] = RBAC_ROLES.map(
  (key) => ({
    key,
    label: RBAC_ROLE_LABELS[key],
    description: ROLE_DESCRIPTIONS[key],
    permissions: ROLE_PERMISSION_MAP[key],
  }),
);

export function isRbacRoleKey(value: string): value is RbacRoleKey {
  return (RBAC_ROLES as readonly string[]).includes(value);
}

export function getRbacRoleDefinition(
  role: RbacRoleKey,
): RbacRoleDefinition | undefined {
  return DEFAULT_RBAC_ROLES.find((item) => item.key === role);
}

export function getDefaultRolePermissions(
  role: RbacRoleKey,
): readonly PlatformPermission[] {
  return ROLE_PERMISSION_MAP[role];
}

export function listDefaultRbacRoles(): readonly RbacRoleDefinition[] {
  return DEFAULT_RBAC_ROLES;
}
