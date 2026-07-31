/**
 * Automation domain events (placeholder).
 * Prefer Platform Event Bus (`@/core/platform-events`) + workflow channel.
 */

export const AUTOMATION_EVENTS = [
  "automation_created",
  "automation_updated",
  "automation_deleted",
  "automation_enabled",
  "automation_disabled",
  "automation_executed",
] as const;

export type AutomationEventName = (typeof AUTOMATION_EVENTS)[number];

export type AutomationDomainEvent = {
  name: AutomationEventName;
  automationId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
