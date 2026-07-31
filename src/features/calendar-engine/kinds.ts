/**
 * Calendar Engine event source kinds (presentation only).
 */

export const CALENDAR_EVENT_KINDS = [
  "meeting",
  "task",
  "milestone",
] as const;

export type CalendarEventKind = (typeof CALENDAR_EVENT_KINDS)[number];

export const CALENDAR_VIEWS = ["month", "week", "day", "agenda"] as const;

export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export const CALENDAR_FILTERS = [
  "all",
  "meetings",
  "tasks",
  "timeline",
] as const;

export type CalendarFilter = (typeof CALENDAR_FILTERS)[number];

/** Future-ready scope placeholders (not wired). */
export const CALENDAR_SCOPES = ["all", "personal", "company"] as const;

export type CalendarScope = (typeof CALENDAR_SCOPES)[number];
