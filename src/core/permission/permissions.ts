/**
 * Platform permission catalog (Project 042).
 * RBAC assignment and company isolation are deferred.
 */

export const PLATFORM_PERMISSIONS = [
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
  "company.manage",
  "workspace.manage",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];

/** Alias used by the Permission module public surface. */
export type PermissionKey = PlatformPermission;

export const PLATFORM_PERMISSION_SET = new Set<string>(PLATFORM_PERMISSIONS);

export function isPlatformPermission(
  value: string,
): value is PlatformPermission {
  return PLATFORM_PERMISSION_SET.has(value);
}
