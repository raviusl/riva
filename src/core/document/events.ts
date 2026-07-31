/**
 * Document domain events (placeholder).
 * Emission / consumers deferred until the domain event bus exists.
 */

export const DOCUMENT_EVENTS = [
  "document_uploaded",
  "document_updated",
  "document_deleted",
] as const;

export type DocumentEventName = (typeof DOCUMENT_EVENTS)[number];

export type DocumentDomainEvent = {
  name: DocumentEventName;
  documentId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
