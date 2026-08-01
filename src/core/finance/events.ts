/**
 * Finance domain events (placeholder + quotation lifecycle).
 * Emission / consumers deferred until the domain event bus exists.
 */

export const FINANCE_EVENTS = [
  "finance_created",
  "finance_updated",
  "finance_deleted",
  "invoice_paid",
  "invoice_overdue",
  "payment_received",
  "quotation_created",
  "quotation_updated",
  "quotation_sent",
  "quotation_accepted",
  "quotation_rejected",
  "quotation_expired",
  "quotation_voided",
  "quotation_converted",
  "quotation_deleted",
] as const;

export type FinanceEventName = (typeof FINANCE_EVENTS)[number];

export type FinanceDomainEvent = {
  name: FinanceEventName;
  financeId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};

export function buildFinanceEvent(input: {
  name: FinanceEventName;
  financeId: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
}): FinanceDomainEvent {
  return {
    name: input.name,
    financeId: input.financeId,
    occurredAt: new Date().toISOString(),
    actorId: input.actorId ?? null,
    payload: input.payload,
  };
}
