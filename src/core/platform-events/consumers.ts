/**
 * Channel consumers — shared interfaces over PlatformEvent[].
 * Activity / Notification / Workflow / AI Brief must use these, not peer engines.
 */

import type { CreateAuditRecordInput } from "@/core/audit/schema";
import { buildAuditRecord } from "@/core/audit/service";
import type {
  PlatformEvent,
  PlatformEventChannel,
} from "@/core/platform-events/types";

export type PlatformEventConsumer<T> = {
  readonly channel: PlatformEventChannel;
  consume(events: readonly PlatformEvent[]): T;
};

export function selectChannelEvents(
  events: readonly PlatformEvent[],
  channel: PlatformEventChannel,
): PlatformEvent[] {
  return events
    .filter((event) => event.channels.includes(channel))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function asUuidOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}

/** Activity Feed consumer — events destined for the unified stream. */
export const activityEventConsumer: PlatformEventConsumer<PlatformEvent[]> = {
  channel: "activity",
  consume(events) {
    return selectChannelEvents(events, "activity");
  },
};

/** Notification Center consumer — attention-oriented events. */
export const notificationEventConsumer: PlatformEventConsumer<PlatformEvent[]> =
  {
    channel: "notification",
    consume(events) {
      return selectChannelEvents(events, "notification");
    },
  };

/** Workflow / Automation consumer — trigger candidates. */
export const workflowEventConsumer: PlatformEventConsumer<PlatformEvent[]> = {
  channel: "workflow",
  consume(events) {
    return selectChannelEvents(events, "workflow");
  },
};

export type AiDailyBriefSignals = {
  overdueTaskCount: number;
  dueTodayTaskCount: number;
  meetingReminderCount: number;
  recentActivityCount: number;
  events: PlatformEvent[];
};

/** AI Daily Brief consumer — calm signal extraction only. */
export const aiDailyBriefConsumer: PlatformEventConsumer<AiDailyBriefSignals> =
  {
    channel: "ai_brief",
    consume(events) {
      const scoped = selectChannelEvents(events, "ai_brief");
      return {
        overdueTaskCount: scoped.filter((e) => e.name === "overdue").length,
        dueTodayTaskCount: scoped.filter((e) => e.name === "due_today").length,
        meetingReminderCount: scoped.filter((e) => e.name === "reminder")
          .length,
        recentActivityCount: scoped.length,
        events: scoped,
      };
    },
  };

/**
 * Audit consumer — maps platform events into Audit create drafts.
 * Persistence remains deferred (Audit Foundation).
 */
export const auditEventConsumer: PlatformEventConsumer<
  CreateAuditRecordInput[]
> = {
  channel: "audit",
  consume(events) {
    return selectChannelEvents(events, "audit").map((event) =>
      buildAuditRecord({
        companyId: asUuidOrNull(event.companyId),
        workspaceId: asUuidOrNull(event.workspaceId),
        actorId: asUuidOrNull(event.actorId),
        actorType: "person",
        entityType: mapEntityToAudit(event.entity),
        entityId: event.entityId.slice(0, 128),
        action: mapNameToAuditAction(event.name),
        before: null,
        after: {
          title: event.title,
          description: event.description,
          name: event.name,
        },
        metadata: {
          ...event.metadata,
          platformEventId: event.id,
          href: event.href,
        },
      }),
    );
  },
};

function mapEntityToAudit(
  entity: PlatformEvent["entity"],
): CreateAuditRecordInput["entityType"] {
  switch (entity) {
    case "project":
      return "project";
    case "client":
      return "client";
    case "vendor":
      return "vendor";
    case "meeting":
      return "meeting";
    case "task":
      return "task";
    case "timeline":
      return "timeline";
    case "notification":
      return "notification";
    case "documents":
      return "document";
    case "finance":
      return "finance";
    case "workflow":
      return "automation";
    default:
      return "workspace";
  }
}

function mapNameToAuditAction(
  name: PlatformEvent["name"],
): CreateAuditRecordInput["action"] {
  switch (name) {
    case "created":
    case "published":
    case "scheduled":
    case "placeholder":
      return "create";
    case "assigned":
      return "assign";
    case "cancelled":
      return "delete";
    default:
      return "update";
  }
}
