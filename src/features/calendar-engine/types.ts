/**
 * Calendar Engine view types — presentation layer only.
 * No separate calendar records; events derive from Meeting / Task / Timeline.
 */

import type { CalendarEventKind } from "@/features/calendar-engine/kinds";

export type CalendarEvent = {
  id: string;
  kind: CalendarEventKind;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm or null (all-day / date-only) */
  time: string | null;
  /** ISO datetime when available (sorting). */
  occursAt: string;
  status: string;
  relatedProjectId: string | null;
  relatedProjectName: string | null;
  href: string;
  sourceId: string;
};

export type CalendarDayBucket = {
  date: string;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
};
