/**
 * Chinese labels for Calendar Engine.
 */

import type {
  CalendarEventKind,
  CalendarFilter,
  CalendarView,
} from "@/features/calendar-engine/kinds";
import { uiZh } from "@/config/ui-zh";

export function formatCalendarEventKind(kind: CalendarEventKind): string {
  switch (kind) {
    case "meeting":
      return uiZh.calendarTypeMeeting;
    case "task":
      return uiZh.calendarTypeTask;
    case "milestone":
      return uiZh.calendarTypeMilestone;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function formatCalendarView(view: CalendarView): string {
  switch (view) {
    case "month":
      return uiZh.calendarViewMonth;
    case "week":
      return uiZh.calendarViewWeek;
    case "day":
      return uiZh.calendarViewDay;
    case "agenda":
      return uiZh.calendarViewAgenda;
    default: {
      const _exhaustive: never = view;
      return _exhaustive;
    }
  }
}

export function formatCalendarFilter(filter: CalendarFilter): string {
  switch (filter) {
    case "all":
      return uiZh.all;
    case "meetings":
      return uiZh.meetings;
    case "tasks":
      return uiZh.tasks;
    case "timeline":
      return uiZh.timeline;
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export const WEEKDAY_LABELS_ZH = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "日",
] as const;
