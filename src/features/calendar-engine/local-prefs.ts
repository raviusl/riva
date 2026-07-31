/**
 * Client prefs for Calendar Engine view / filter.
 */

import type {
  CalendarFilter,
  CalendarView,
} from "@/features/calendar-engine/kinds";

export type CalendarLocalPrefs = {
  view: CalendarView;
  filter: CalendarFilter;
};

const STORAGE_KEY = "riva.calendar-engine.v1.prefs";

export function defaultCalendarPrefs(): CalendarLocalPrefs {
  return { view: "month", filter: "all" };
}

export function readCalendarPrefs(): CalendarLocalPrefs {
  if (typeof window === "undefined") return defaultCalendarPrefs();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCalendarPrefs();
    const parsed = JSON.parse(raw) as Partial<CalendarLocalPrefs>;
    return {
      view:
        parsed.view === "week" ||
        parsed.view === "day" ||
        parsed.view === "agenda" ||
        parsed.view === "month"
          ? parsed.view
          : "month",
      filter:
        parsed.filter === "meetings" ||
        parsed.filter === "tasks" ||
        parsed.filter === "timeline" ||
        parsed.filter === "all"
          ? parsed.filter
          : "all",
    };
  } catch {
    return defaultCalendarPrefs();
  }
}

export function writeCalendarPrefs(prefs: CalendarLocalPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
