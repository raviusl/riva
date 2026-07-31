/**
 * Audit Log Foundation constants (Project 047).
 */

export const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "restore",
  "archive",
  "login",
  "logout",
  "assign",
  "approve",
  "reject",
  "upload",
  "download",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTOR_TYPES = [
  "person",
  "system",
  "ai",
  "automation",
] as const;

export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

export const AUDIT_ENTITY_TYPES = [
  "workspace",
  "company",
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
  "user",
  "membership",
  "storage",
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];
