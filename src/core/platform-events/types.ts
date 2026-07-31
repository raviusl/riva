/**
 * Platform Event Bus — Project 088 foundation.
 * Unified event shape for Activity, Notification, Workflow, AI Brief, Audit.
 */

export const PLATFORM_EVENT_ENTITIES = [
  "project",
  "client",
  "vendor",
  "meeting",
  "task",
  "timeline",
  "notification",
  "finance",
  "documents",
  "calendar",
  "system",
  "workflow",
] as const;

export type PlatformEventEntity = (typeof PLATFORM_EVENT_ENTITIES)[number];

export const PLATFORM_EVENT_NAMES = [
  "created",
  "updated",
  "assigned",
  "completed",
  "cancelled",
  "scheduled",
  "status_changed",
  "due_today",
  "overdue",
  "reminder",
  "published",
  "placeholder",
  "milestone_active",
  "milestone_completed",
] as const;

export type PlatformEventName = (typeof PLATFORM_EVENT_NAMES)[number];

export const PLATFORM_EVENT_CHANNELS = [
  "activity",
  "notification",
  "workflow",
  "ai_brief",
  "audit",
] as const;

export type PlatformEventChannel = (typeof PLATFORM_EVENT_CHANNELS)[number];

export type PlatformEventMetadata = Readonly<Record<string, unknown>>;

/**
 * Canonical platform event — standardized across all engines.
 */
export type PlatformEvent = {
  id: string;
  name: PlatformEventName;
  entity: PlatformEventEntity;
  entityId: string;
  title: string;
  description: string;
  timestamp: string;
  companyId: string;
  workspaceId: string;
  actorId: string | null;
  actorLabel: string | null;
  href: string | null;
  metadata: PlatformEventMetadata;
  channels: readonly PlatformEventChannel[];
};

export type PublishPlatformEventInput = {
  companyId: string;
  workspaceId: string;
  name: PlatformEventName;
  entity: PlatformEventEntity;
  entityId: string;
  title: string;
  description: string;
  timestamp: string;
  actorId?: string | null;
  actorLabel?: string | null;
  href?: string | null;
  metadata?: PlatformEventMetadata;
  channels: readonly PlatformEventChannel[];
  /** Extra seed salt for deterministic id uniqueness. */
  salt?: string;
};
