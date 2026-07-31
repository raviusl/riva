/**
 * Vendor CRM audit helpers (Project 053).
 * Reuses Audit Log Foundation — in-memory trail until audit persistence lands.
 */

import {
  buildAuditRecord,
  compareChanges,
  type AuditAction,
  type AuditRecord,
  type CreateAuditRecordInput,
} from "@/core/audit";
import type { Vendor } from "@/core/types";

const MAX_TRAIL = 100;
const vendorAuditTrail = new Map<string, AuditRecord[]>();

function vendorSnapshot(vendor: Vendor): Record<string, unknown> {
  return {
    id: vendor.id,
    name: vendor.name,
    company_name: vendor.company_name,
    contact_person: vendor.contact_person,
    email: vendor.email,
    phone: vendor.phone,
    website: vendor.website,
    address: vendor.address,
    category: vendor.category,
    status: vendor.status,
    project_id: vendor.project_id,
    owner_id: vendor.owner_id,
    notes: vendor.notes,
  };
}

function trailKey(companyId: string, vendorId: string) {
  return `${companyId}:${vendorId}`;
}

function pushTrail(record: AuditRecord) {
  const key = trailKey(record.companyId ?? "unknown", record.entityId);
  const existing = vendorAuditTrail.get(key) ?? [];
  vendorAuditTrail.set(key, [record, ...existing].slice(0, MAX_TRAIL));
}

export type RecordVendorAuditInput = {
  action: AuditAction;
  actorId: string;
  before: Vendor | null;
  after: Vendor;
  metadata?: Record<string, unknown>;
};

export function recordVendorAudit(input: RecordVendorAuditInput): AuditRecord {
  const before = input.before ? vendorSnapshot(input.before) : null;
  const after = vendorSnapshot(input.after);
  const changes = compareChanges(before, after);

  const payload: CreateAuditRecordInput = buildAuditRecord({
    companyId: input.after.company_id,
    workspaceId: input.after.workspace_id,
    actorId: input.actorId,
    actorType: "person",
    entityType: "vendor",
    entityId: input.after.id,
    action: input.action,
    before,
    after,
    metadata: {
      ...input.metadata,
      changes,
      vendorName: input.after.name,
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

export function listVendorAuditTrail(
  companyId: string,
  vendorId: string,
): AuditRecord[] {
  return [...(vendorAuditTrail.get(trailKey(companyId, vendorId)) ?? [])];
}
