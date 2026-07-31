/**
 * Meeting CRM audit helpers (Project 054).
 * Reuses Audit Log Foundation — in-memory trail until audit persistence lands.
 */

import {
  buildAuditRecord,
  compareChanges,
  type AuditAction,
  type AuditRecord,
  type CreateAuditRecordInput,
} from "@/core/audit";
import type { Meeting } from "@/core/meeting/types";

const MAX_TRAIL = 100;
const meetingAuditTrail = new Map<string, AuditRecord[]>();

function meetingSnapshot(meeting: Meeting): Record<string, unknown> {
  return {
    id: meeting.id,
    title: meeting.title,
    meeting_type: meeting.meeting_type,
    status: meeting.status,
    meeting_date: meeting.meeting_date,
    meeting_time: meeting.meeting_time,
    duration_minutes: meeting.duration_minutes,
    starts_at: meeting.starts_at,
    location: meeting.location,
    google_meet_link: meeting.google_meet_link,
    project_id: meeting.project_id,
    client_id: meeting.client_id,
    owner_id: meeting.owner_id,
    vendor_ids: meeting.vendor_ids,
    notes: meeting.notes,
    internal_notes: meeting.internal_notes,
    participants: meeting.participants,
  };
}

function trailKey(companyId: string, meetingId: string) {
  return `${companyId}:${meetingId}`;
}

function pushTrail(record: AuditRecord) {
  const key = trailKey(record.companyId ?? "unknown", record.entityId);
  const existing = meetingAuditTrail.get(key) ?? [];
  meetingAuditTrail.set(key, [record, ...existing].slice(0, MAX_TRAIL));
}

export type RecordMeetingAuditInput = {
  action: AuditAction;
  actorId: string;
  before: Meeting | null;
  after: Meeting;
  metadata?: Record<string, unknown>;
};

export function recordMeetingAudit(
  input: RecordMeetingAuditInput,
): AuditRecord {
  const before = input.before ? meetingSnapshot(input.before) : null;
  const after = meetingSnapshot(input.after);
  const changes = compareChanges(before, after);

  const payload: CreateAuditRecordInput = buildAuditRecord({
    companyId: input.after.company_id,
    workspaceId: input.after.workspace_id,
    actorId: input.actorId,
    actorType: "person",
    entityType: "meeting",
    entityId: input.after.id,
    action: input.action,
    before,
    after,
    metadata: {
      ...input.metadata,
      changes,
      meetingTitle: input.after.title,
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

export function listMeetingAuditTrail(
  companyId: string,
  meetingId: string,
): AuditRecord[] {
  return [...(meetingAuditTrail.get(trailKey(companyId, meetingId)) ?? [])];
}
