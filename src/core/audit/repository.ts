import type {
  CreateAuditRecordInput,
  ListAuditRecordsQuery,
} from "@/core/audit/schema";
import type { AuditRecord, AuditRecordId } from "@/core/audit/types";

/**
 * Audit persistence contract — implementation deferred.
 * No database tables or migrations in Project 047.
 */
export interface AuditRepository {
  findById(auditRecordId: AuditRecordId): Promise<AuditRecord | null>;
  list(query: ListAuditRecordsQuery): Promise<AuditRecord[]>;
  record(input: CreateAuditRecordInput): Promise<AuditRecord>;
}
