/**
 * Finance audit helpers (Project 089).
 * Reuses Audit Log Foundation — in-memory trail until audit persistence lands.
 */

import {
  buildAuditRecord,
  compareChanges,
  type AuditAction,
  type AuditRecord,
  type CreateAuditRecordInput,
} from "@/core/audit";
import type { Finance } from "@/core/finance/types";

const MAX_TRAIL = 100;
const financeAuditTrail = new Map<string, AuditRecord[]>();

function financeSnapshot(finance: Finance): Record<string, unknown> {
  return {
    id: finance.id,
    type: finance.type,
    status: finance.status,
    category: finance.category,
    currency: finance.currency,
    amount: finance.amount,
    tax: finance.tax,
    discount: finance.discount,
    reference_number: finance.referenceNumber,
    issued_at: finance.issuedAt,
    due_at: finance.dueAt,
    paid_at: finance.paidAt,
    project_id: finance.projectId,
    client_id: finance.clientId,
    vendor_id: finance.vendorId,
    converted_invoice_id: finance.convertedInvoiceId,
    notes: finance.notes,
    internal_notes: finance.internalNotes,
  };
}

function trailKey(companyId: string, financeId: string) {
  return `${companyId}:${financeId}`;
}

function pushTrail(record: AuditRecord) {
  const key = trailKey(record.companyId ?? "unknown", record.entityId);
  const existing = financeAuditTrail.get(key) ?? [];
  financeAuditTrail.set(key, [record, ...existing].slice(0, MAX_TRAIL));
}

export type RecordFinanceAuditInput = {
  action: AuditAction;
  actorId: string;
  before: Finance | null;
  after: Finance;
  metadata?: Record<string, unknown>;
};

export function recordFinanceAudit(
  input: RecordFinanceAuditInput,
): AuditRecord {
  const before = input.before ? financeSnapshot(input.before) : null;
  const after = financeSnapshot(input.after);
  const changes = compareChanges(before, after);

  const payload: CreateAuditRecordInput = buildAuditRecord({
    companyId: input.after.companyId,
    workspaceId: input.after.workspaceId,
    actorId: input.actorId,
    actorType: "person",
    entityType: "finance",
    entityId: input.after.id,
    action: input.action,
    before,
    after,
    metadata: {
      ...input.metadata,
      changes,
      financeType: input.after.type,
      referenceNumber: input.after.referenceNumber,
    },
  });

  const record: AuditRecord = {
    id: crypto.randomUUID(),
    companyId: payload.companyId ?? null,
    workspaceId: payload.workspaceId ?? null,
    actorId: payload.actorId ?? null,
    actorType: payload.actorType ?? "person",
    entityType: payload.entityType,
    entityId: payload.entityId,
    action: payload.action,
    before: payload.before ?? null,
    after: payload.after ?? null,
    metadata: payload.metadata ?? {},
    ipAddress: payload.ipAddress ?? null,
    userAgent: payload.userAgent ?? null,
    createdAt: new Date().toISOString(),
  };

  pushTrail(record);
  return record;
}

export function listFinanceAuditTrail(
  companyId: string,
  financeId: string,
): AuditRecord[] {
  return [...(financeAuditTrail.get(trailKey(companyId, financeId)) ?? [])];
}
