/**
 * Finance domain events (placeholder).
 * Emission / consumers deferred until the domain event bus exists.
 */

export const FINANCE_EVENTS = [
  "finance_created",
  "finance_updated",
  "finance_deleted",
  "invoice_paid",
  "invoice_overdue",
  "payment_received",
] as const;

export type FinanceEventName = (typeof FINANCE_EVENTS)[number];

export type FinanceDomainEvent = {
  name: FinanceEventName;
  financeId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
