import { z } from "zod";

import {
  AUDIT_ACTIONS,
  AUDIT_ACTOR_TYPES,
  AUDIT_ENTITY_TYPES,
} from "@/core/audit/constants";

export const auditActionSchema = z.enum(AUDIT_ACTIONS);
export const auditActorTypeSchema = z.enum(AUDIT_ACTOR_TYPES);
export const auditEntityTypeSchema = z.enum(AUDIT_ENTITY_TYPES);

export const auditRecordIdSchema = z.object({
  auditRecordId: z.string().uuid(),
});

export type AuditRecordIdInput = z.infer<typeof auditRecordIdSchema>;

export const auditMetadataSchema = z.record(z.string(), z.unknown());

export const createAuditRecordSchema = z.object({
  companyId: z.string().uuid().optional().nullable(),
  workspaceId: z.string().uuid().optional().nullable(),
  actorId: z.string().uuid().optional().nullable(),
  actorType: auditActorTypeSchema.optional().default("person"),
  entityType: auditEntityTypeSchema,
  entityId: z.string().min(1).max(128),
  action: auditActionSchema,
  before: z.unknown().optional().nullable().default(null),
  after: z.unknown().optional().nullable().default(null),
  metadata: auditMetadataSchema.optional().default({}),
  ipAddress: z.string().max(128).optional().nullable(),
  userAgent: z.string().max(1000).optional().nullable(),
});

export type CreateAuditRecordInput = z.infer<typeof createAuditRecordSchema>;

export const listAuditRecordsQuerySchema = z.object({
  companyId: z.string().uuid().optional(),
  workspaceId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  entityType: auditEntityTypeSchema.optional(),
  entityId: z.string().min(1).max(128).optional(),
  action: auditActionSchema.optional(),
  limit: z.number().int().positive().max(500).optional().default(50),
});

export type ListAuditRecordsQuery = z.infer<typeof listAuditRecordsQuerySchema>;

export const auditRecordSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid().nullable(),
  workspaceId: z.string().uuid().nullable(),
  actorId: z.string().uuid().nullable(),
  actorType: auditActorTypeSchema,
  entityType: auditEntityTypeSchema,
  entityId: z.string().min(1).max(128),
  action: auditActionSchema,
  before: z.unknown().nullable(),
  after: z.unknown().nullable(),
  metadata: auditMetadataSchema,
  ipAddress: z.string().max(128).nullable(),
  userAgent: z.string().max(1000).nullable(),
  createdAt: z.string().min(1),
});
