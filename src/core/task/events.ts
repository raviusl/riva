/**
 * Task domain events (placeholder).
 * Emission / consumers deferred until the domain event bus exists.
 */

export const TASK_EVENTS = [
  "task.created",
  "task.updated",
  "task.completed",
  "task.cancelled",
  "task.deleted",
  "task.assigned",
] as const;

export type TaskEventName = (typeof TASK_EVENTS)[number];

export type TaskDomainEvent = {
  name: TaskEventName;
  taskId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
