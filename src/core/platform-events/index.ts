/**
 * Platform Event Bus — Project 088.
 * Unified publish / subscribe for Activity, Notification, Workflow, AI Brief, Audit.
 */

export type {
  PlatformEvent,
  PlatformEventChannel,
  PlatformEventEntity,
  PlatformEventMetadata,
  PlatformEventName,
  PublishPlatformEventInput,
} from "@/core/platform-events/types";

export {
  PLATFORM_EVENT_CHANNELS,
  PLATFORM_EVENT_ENTITIES,
  PLATFORM_EVENT_NAMES,
} from "@/core/platform-events/types";

export { platformEventIdFromSeed } from "@/core/platform-events/id";
export { publishPlatformEvent } from "@/core/platform-events/publish";

export type {
  PlatformEventBus,
  PlatformEventHandler,
} from "@/core/platform-events/bus";
export {
  createInMemoryPlatformEventBus,
  getSharedPlatformEventBus,
} from "@/core/platform-events/bus";

export type {
  AiDailyBriefSignals,
  PlatformEventConsumer,
} from "@/core/platform-events/consumers";
export {
  activityEventConsumer,
  aiDailyBriefConsumer,
  auditEventConsumer,
  notificationEventConsumer,
  selectChannelEvents,
  workflowEventConsumer,
} from "@/core/platform-events/consumers";

export type { DerivePlatformEventsInput } from "@/core/platform-events/derive-entity-events";
export { derivePlatformEvents } from "@/core/platform-events/derive-entity-events";

export type { WorkflowTriggerCandidate } from "@/core/platform-events/workflow-adapter";
export { consumeWorkflowTriggersFromEvents } from "@/core/platform-events/workflow-adapter";
