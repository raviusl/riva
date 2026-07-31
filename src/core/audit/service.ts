import { CoreError } from "@/core/errors";
import {
  AUDIT_ACTIONS,
  type AuditAction,
} from "@/core/audit/constants";
import {
  auditRecordSchema,
  createAuditRecordSchema,
  listAuditRecordsQuerySchema,
  type CreateAuditRecordInput,
  type ListAuditRecordsQuery,
} from "@/core/audit/schema";
import type {
  AuditChange,
  AuditMetadata,
  AuditRecord,
} from "@/core/audit/types";

const SENSITIVE_METADATA_KEYS = new Set([
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
]);

/**
 * Audit domain service contract.
 * Project 047: build / compare / metadata helpers only — no persistence.
 */
export interface AuditService {
  buildAuditRecord(input: unknown): CreateAuditRecordInput;
  recordAction(input: unknown): Promise<AuditRecord>;
  compareChanges(
    before: Record<string, unknown> | null | undefined,
    after: Record<string, unknown> | null | undefined,
  ): AuditChange[];
  prepareMetadata(metadata: unknown): AuditMetadata;
  findById(auditRecordId: string): Promise<AuditRecord>;
  list(query: ListAuditRecordsQuery): Promise<AuditRecord[]>;
}

/** Normalize free-form action strings into catalog actions. */
export function normalizeAction(action: string): AuditAction {
  const normalized = action.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, AuditAction> = {
    created: "create",
    updated: "update",
    deleted: "delete",
    restored: "restore",
    archived: "archive",
    logged_in: "login",
    log_in: "login",
    signed_in: "login",
    logged_out: "logout",
    log_out: "logout",
    signed_out: "logout",
    assigned: "assign",
    approved: "approve",
    rejected: "reject",
    uploaded: "upload",
    downloaded: "download",
  };
  const mapped = aliases[normalized] ?? normalized;
  if (!(AUDIT_ACTIONS as readonly string[]).includes(mapped)) {
    throw new CoreError(
      "AUDIT_ACTION_INVALID",
      `Unsupported audit action: ${action}`,
    );
  }
  return mapped as AuditAction;
}

/** Strip sensitive keys from metadata payloads. */
export function sanitizeMetadata(metadata: unknown): AuditMetadata {
  if (metadata == null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (SENSITIVE_METADATA_KEYS.has(key)) {
      output[key] = "[redacted]";
      continue;
    }
    output[key] = value;
  }
  return output;
}

/** Alias used by the service surface. */
export function prepareMetadata(metadata: unknown): AuditMetadata {
  return sanitizeMetadata(metadata);
}

/** Validate a full or create-shaped audit record payload. */
export function validateAuditRecord(input: unknown): CreateAuditRecordInput {
  const values = createAuditRecordSchema.parse({
    ...(typeof input === "object" && input !== null ? input : {}),
    action:
      typeof input === "object" &&
      input !== null &&
      "action" in input &&
      typeof (input as { action: unknown }).action === "string"
        ? normalizeAction((input as { action: string }).action)
        : undefined,
  });
  return {
    ...values,
    metadata: sanitizeMetadata(values.metadata),
    before: values.before ?? null,
    after: values.after ?? null,
    ipAddress: values.ipAddress ?? null,
    userAgent: values.userAgent ?? null,
  };
}

/** Build a validated create payload for future persistence. */
export function buildAuditRecord(input: unknown): CreateAuditRecordInput {
  return validateAuditRecord(input);
}

/**
 * Shallow field diff between before/after objects.
 * Nested objects are compared by JSON equality.
 */
export function compareChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): AuditChange[] {
  const left = before ?? {};
  const right = after ?? {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const changes: AuditChange[] = [];

  for (const field of keys) {
    const previous = left[field];
    const next = right[field];
    if (stableStringify(previous) === stableStringify(next)) continue;
    changes.push({ field, before: previous, after: next });
  }

  return changes;
}

export function validateListAuditRecordsQuery(
  input: unknown,
): ListAuditRecordsQuery {
  return listAuditRecordsQuerySchema.parse(input);
}

export function validateStoredAuditRecord(input: unknown): AuditRecord {
  return auditRecordSchema.parse(input);
}

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
