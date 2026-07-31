/**
 * Client CRM audit helpers (Project 052).
 * Reuses Audit Log Foundation — in-memory trail until audit persistence lands.
 */

import {
  buildAuditRecord,
  compareChanges,
  type AuditAction,
  type AuditRecord,
  type CreateAuditRecordInput,
} from "@/core/audit";
import type { Client } from "@/core/types";

const MAX_TRAIL = 100;
const clientAuditTrail = new Map<string, AuditRecord[]>();

function clientSnapshot(client: Client): Record<string, unknown> {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    client_type: client.client_type,
    status: client.status,
    project_id: client.project_id,
    owner_id: client.owner_id,
    follow_up_at: client.follow_up_at,
    notes: client.notes,
  };
}

function trailKey(companyId: string, clientId: string) {
  return `${companyId}:${clientId}`;
}

function pushTrail(record: AuditRecord) {
  const key = trailKey(record.companyId ?? "unknown", record.entityId);
  const existing = clientAuditTrail.get(key) ?? [];
  clientAuditTrail.set(key, [record, ...existing].slice(0, MAX_TRAIL));
}

export type RecordClientAuditInput = {
  action: AuditAction;
  actorId: string;
  before: Client | null;
  after: Client;
  metadata?: Record<string, unknown>;
};

/**
 * Build + buffer an audit record for a client mutation.
 * Does not hit the database (Audit Foundation has no persistence yet).
 */
export function recordClientAudit(input: RecordClientAuditInput): AuditRecord {
  const before = input.before ? clientSnapshot(input.before) : null;
  const after = clientSnapshot(input.after);
  const changes = compareChanges(before, after);

  const payload: CreateAuditRecordInput = buildAuditRecord({
    companyId: input.after.company_id,
    workspaceId: input.after.workspace_id,
    actorId: input.actorId,
    actorType: "person",
    entityType: "client",
    entityId: input.after.id,
    action: input.action,
    before,
    after,
    metadata: {
      ...input.metadata,
      changes,
      clientName: input.after.name,
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

export function listClientAuditTrail(
  companyId: string,
  clientId: string,
): AuditRecord[] {
  return [...(clientAuditTrail.get(trailKey(companyId, clientId)) ?? [])];
}
