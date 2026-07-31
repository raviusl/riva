/**
 * Workflow consumer adapter — Automation trigger candidates from Event Bus.
 */

import { workflowEventConsumer } from "@/core/platform-events/consumers";
import type { PlatformEvent } from "@/core/platform-events/types";

export type WorkflowTriggerCandidate = {
  eventId: string;
  trigger: PlatformEvent["name"];
  entity: PlatformEvent["entity"];
  entityId: string;
  companyId: string;
  workspaceId: string;
  timestamp: string;
  metadata: PlatformEvent["metadata"];
};

/**
 * Map workflow-channel events into automation trigger candidates.
 * Scheduler / rule engine wiring remains deferred.
 */
export function consumeWorkflowTriggersFromEvents(
  events: readonly PlatformEvent[],
): WorkflowTriggerCandidate[] {
  return workflowEventConsumer.consume(events).map((event) => ({
    eventId: event.id,
    trigger: event.name,
    entity: event.entity,
    entityId: event.entityId,
    companyId: event.companyId,
    workspaceId: event.workspaceId,
    timestamp: event.timestamp,
    metadata: event.metadata,
  }));
}
