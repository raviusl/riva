export const TIMELINE_EVENTS = [
  "timeline.entry.created",
  "timeline.entry.updated",
  "timeline.entry.deleted",
] as const;

export type TimelineEventName = (typeof TIMELINE_EVENTS)[number];

export type TimelineDomainEvent = {
  name: TimelineEventName;
  timelineEntryId: string;
  occurredAt: string;
  actorId?: string | null;
  payload?: Record<string, unknown>;
};
