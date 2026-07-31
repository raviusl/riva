/**
 * Task CRM audit helpers (Project 055).
 * Reuses Audit Log Foundation — in-memory trail until audit persistence lands.
 */

import {
  buildAuditRecord,
  compareChanges,
  type AuditAction,
  type AuditRecord,
  type CreateAuditRecordInput,
} from "@/core/audit";
import type { Task } from "@/core/task/types";

const MAX_TRAIL = 100;
const taskAuditTrail = new Map<string, AuditRecord[]>();

function taskSnapshot(task: Task): Record<string, unknown> {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    start_date: task.startDate,
    due_date: task.dueDate,
    completed_date: task.completedDate,
    owner_id: task.ownerId,
    assignee_id: task.assigneeId,
    followers: task.followers,
    related_project_id: task.relatedProjectId,
    related_client_id: task.relatedClientId,
    related_vendor_id: task.relatedVendorId,
    related_meeting_id: task.relatedMeetingId,
    tags: task.tags,
    archived_at: task.archivedAt,
  };
}

function trailKey(companyId: string, taskId: string) {
  return `${companyId}:${taskId}`;
}

function pushTrail(record: AuditRecord) {
  const key = trailKey(record.companyId ?? "unknown", record.entityId);
  const existing = taskAuditTrail.get(key) ?? [];
  taskAuditTrail.set(key, [record, ...existing].slice(0, MAX_TRAIL));
}

export type RecordTaskAuditInput = {
  action: AuditAction;
  actorId: string;
  before: Task | null;
  after: Task;
  metadata?: Record<string, unknown>;
};

export function recordTaskAudit(input: RecordTaskAuditInput): AuditRecord {
  const before = input.before ? taskSnapshot(input.before) : null;
  const after = taskSnapshot(input.after);
  const changes = compareChanges(before, after);

  const payload: CreateAuditRecordInput = buildAuditRecord({
    companyId: input.after.companyId,
    workspaceId: input.after.workspaceId,
    actorId: input.actorId,
    actorType: "person",
    entityType: "task",
    entityId: input.after.id,
    action: input.action,
    before,
    after,
    metadata: {
      ...input.metadata,
      changes,
      taskTitle: input.after.title,
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

export function listTaskAuditTrail(
  companyId: string,
  taskId: string,
): AuditRecord[] {
  return [...(taskAuditTrail.get(trailKey(companyId, taskId)) ?? [])];
}
