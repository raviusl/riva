/**
 * Audit domain events (placeholder).
 * Emission / consumers deferred until the domain event bus exists.
 */

export const AUDIT_EVENTS = [
  "audit_recorded",
  "audit_listed",
] as const;

export type AuditEventName = (typeof AUDIT_EVENTS)[number];

export type AuditDomainEvent = {
  name: AuditEventName;
  auditRecordId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
