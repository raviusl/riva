/**
 * Audit Log Foundation — contracts + helpers (Project 047).
 * See docs/architecture/Activity-Foundation.md (Audit companion).
 *
 * No persistence · No database tables · No UI.
 */

export type {
  AuditAction,
  AuditActorType,
  AuditChange,
  AuditEntityType,
  AuditMetadata,
  AuditRecord,
  AuditRecordId,
  AuditRecordModel,
  AuditValue,
} from "@/core/audit/types";

export {
  AUDIT_ACTIONS,
  AUDIT_ACTOR_TYPES,
  AUDIT_ENTITY_TYPES,
} from "@/core/audit/constants";

export type {
  AuditRecordIdInput,
  CreateAuditRecordInput,
  ListAuditRecordsQuery,
} from "@/core/audit/schema";

export {
  auditActionSchema,
  auditActorTypeSchema,
  auditEntityTypeSchema,
  auditMetadataSchema,
  auditRecordIdSchema,
  auditRecordSchema,
  createAuditRecordSchema,
  listAuditRecordsQuerySchema,
} from "@/core/audit/schema";

export type { AuditRepository } from "@/core/audit/repository";

export type { AuditService } from "@/core/audit/service";
export {
  buildAuditRecord,
  compareChanges,
  normalizeAction,
  prepareMetadata,
  sanitizeMetadata,
  validateAuditRecord,
  validateListAuditRecordsQuery,
  validateStoredAuditRecord,
} from "@/core/audit/service";

export type { AuditDomainEvent, AuditEventName } from "@/core/audit/events";
export { AUDIT_EVENTS } from "@/core/audit/events";
