/**
 * Calendar Engine (Project 078).
 * Visualization layer over Meeting, Task, and Timeline Engine.
 */

export type {
  CalendarEventKind,
  CalendarFilter,
  CalendarScope,
  CalendarView,
} from "@/features/calendar-engine/kinds";
export {
  CALENDAR_EVENT_KINDS,
  CALENDAR_FILTERS,
  CALENDAR_SCOPES,
  CALENDAR_VIEWS,
} from "@/features/calendar-engine/kinds";

export type {
  CalendarDayBucket,
  CalendarEvent,
} from "@/features/calendar-engine/types";

export {
  deriveCalendarEvents,
  eventsForDate,
  type DeriveCalendarInput,
} from "@/features/calendar-engine/derive-calendar";

export { CalendarEnginePanel } from "@/features/calendar-engine/calendar-engine-panel";

export {
  formatCalendarEventKind,
  formatCalendarFilter,
  formatCalendarView,
  WEEKDAY_LABELS_ZH,
} from "@/features/calendar-engine/labels";
