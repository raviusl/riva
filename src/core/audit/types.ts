/**
 * Shared Audit Log Foundation types — platform foundation (Project 047).
 * Persistence and UI are deferred.
 */

import type {
  AuditAction,
  AuditActorType,
  AuditEntityType,
} from "@/core/audit/constants";

export type {
  AuditAction,
  AuditActorType,
  AuditEntityType,
} from "@/core/audit/constants";

export type AuditRecordId = string;

export type AuditValue = unknown;

export type AuditMetadata = Readonly<Record<string, unknown>>;

/**
 * Audit Record — immutable evidence of an attempted or completed action.
 */
export type AuditRecord = {
  id: AuditRecordId;
  companyId: string | null;
  workspaceId: string | null;
  actorId: string | null;
  actorType: AuditActorType;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  before: AuditValue;
  after: AuditValue;
  metadata: AuditMetadata;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AuditRecordModel = AuditRecord;

export type AuditChange = {
  field: string;
  before: unknown;
  after: unknown;
};
