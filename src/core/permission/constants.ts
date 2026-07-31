/**
 * Platform permission constants (Project 042).
 * Catalog of stable permission keys shared across domains.
 */

export const PERMISSION_RESOURCES = [
  "project",
  "client",
  "vendor",
  "meeting",
  "task",
  "timeline",
  "document",
  "finance",
  "notification",
  "automation",
  "company",
  "workspace",
] as const;

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number];

export const PERMISSION_ACTIONS = [
  "read",
  "write",
  "delete",
  "assign",
  "approve",
  "export",
  "manage",
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
