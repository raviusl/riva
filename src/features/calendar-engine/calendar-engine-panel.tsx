"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  ListTodoIcon,
  UsersIcon,
} from "lucide-react";

import { loadCompanyCalendarAction } from "@/core/actions/calendar-engine-actions";
import type { Meeting } from "@/core/meeting/types";
import type { Project } from "@/core/types";
import type { Task } from "@/core/task/types";
import { uiZh } from "@/config/ui-zh";
import {
  addDays,
  addMonths,
  buildMonthGrid,
  buildWeekKeys,
  formatDayTitle,
  formatMonthTitle,
  formatWeekTitle,
  todayKey,
} from "@/features/calendar-engine/date-utils";
import {
  deriveCalendarEvents,
  eventsForDate,
} from "@/features/calendar-engine/derive-calendar";
import type { CalendarFilter } from "@/features/calendar-engine/kinds";
import {
  formatCalendarEventKind,
  formatCalendarFilter,
  formatCalendarView,
  WEEKDAY_LABELS_ZH,
} from "@/features/calendar-engine/labels";
import {
  defaultCalendarPrefs,
  readCalendarPrefs,
  writeCalendarPrefs,
} from "@/features/calendar-engine/local-prefs";
import type { CalendarEvent } from "@/features/calendar-engine/types";
import { buildCompanyMilestoneProjections } from "@/features/timeline-engine/build-projections";
import {
  emptyTimelineLocalState,
  readTimelineLocalState,
} from "@/features/timeline-engine/local-state";
import type { ProjectTimelineLocalState } from "@/features/timeline-engine/local-state";
import {
  brandCaptionClassName,
  brandGlassPanelClassName,
  brandGhostButtonClassName,
  brandLabelClassName,
  brandSecondaryButtonClassName,
  brandTitleClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type CalendarEnginePanelProps = {
  workspaceId: string;
  companyId: string;
};

function kindIcon(kind: CalendarEvent["kind"]) {
  switch (kind) {
    case "meeting":
      return UsersIcon;
    case "task":
      return ListTodoIcon;
    case "milestone":
      return FlagIcon;
    default:
      return CalendarDaysIcon;
  }
}

function kindTone(kind: CalendarEvent["kind"]) {
  switch (kind) {
    case "meeting":
      return "border-sky-400/25 bg-sky-400/10 text-sky-100/90";
    case "task":
      return "border-amber-400/25 bg-amber-400/10 text-amber-100/90";
    case "milestone":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100/85";
    default:
      return "border-white/10 bg-white/[0.04] text-white/70";
  }
}

function EventRow({ event }: { event: CalendarEvent }) {
  const Icon = kindIcon(event.kind);
  return (
    <Link
      href={event.href}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-3 py-2.5 transition hover:border-white/14 hover:bg-white/[0.05]",
        kindTone(event.kind),
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0 opacity-80" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white/90">{event.title}</p>
        <p className="mt-0.5 text-[11px] text-white/40">
          {formatCalendarEventKind(event.kind)}
          {event.time ? ` · ${event.time}` : ""}
          {event.status ? ` · ${event.status}` : ""}
          {event.relatedProjectName
            ? ` · ${event.relatedProjectName}`
            : ""}
        </p>
      </div>
    </Link>
  );
}

function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <Link
      href={event.href}
      className={cn(
        "block truncate rounded-md border px-1.5 py-0.5 text-[10px] leading-tight transition hover:brightness-110",
        kindTone(event.kind),
      )}
      title={event.title}
    >
      {event.time ? `${event.time} ` : ""}
      {event.title}
    </Link>
  );
}

export function CalendarEnginePanel({
  workspaceId,
  companyId,
}: CalendarEnginePanelProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [canReadMeetings, setCanReadMeetings] = useState(false);
  const [canReadTasks, setCanReadTasks] = useState(false);
  const [canReadTimeline, setCanReadTimeline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  const [prefs, setPrefs] = useState(defaultCalendarPrefs);
  const [anchor, setAnchor] = useState(todayKey);
  const [timelineLocalByProject, setTimelineLocalByProject] = useState<
    Map<string, ProjectTimelineLocalState>
  >(() => new Map());

  useEffect(() => {
    setPrefs(readCalendarPrefs());
    setAnchor(todayKey());
  }, []);

  useEffect(() => {
    let cancelled = false;
    startTransition(async () => {
      const result = await loadCompanyCalendarAction({
        workspaceId,
        companyId,
      });
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        setLoaded(true);
        return;
      }
      setError(null);
      setMeetings(result.data.meetings);
      setTasks(result.data.tasks);
      setProjects(result.data.projects);
      setCanReadMeetings(result.data.canReadMeetings);
      setCanReadTasks(result.data.canReadTasks);
      setCanReadTimeline(result.data.canReadTimeline);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, companyId]);

  useEffect(() => {
    if (!canReadTimeline || projects.length === 0) return;
    const map = new Map<string, ProjectTimelineLocalState>();
    for (const project of projects) {
      map.set(
        project.id,
        readTimelineLocalState(companyId, project.id) ??
          emptyTimelineLocalState(),
      );
    }
    setTimelineLocalByProject(map);
  }, [canReadTimeline, projects, companyId]);

  const updatePrefs = useCallback(
    (patch: Partial<typeof prefs>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        writeCalendarPrefs(next);
        return next;
      });
    },
    [],
  );

  const events = useMemo(() => {
    const milestones = canReadTimeline
      ? buildCompanyMilestoneProjections({
          projects,
          tasks: canReadTasks ? tasks : [],
          meetings: canReadMeetings ? meetings : [],
          timelineLocalByProject,
        })
      : [];
    return deriveCalendarEvents({
      companyId,
      workspaceId,
      meetings: canReadMeetings ? meetings : [],
      tasks: canReadTasks ? tasks : [],
      projects: canReadTimeline ? projects : [],
      milestones,
      filter: prefs.filter,
    });
  }, [
    companyId,
    workspaceId,
    meetings,
    tasks,
    projects,
    canReadMeetings,
    canReadTasks,
    canReadTimeline,
    timelineLocalByProject,
    prefs.filter,
  ]);

  const availableFilters = useMemo(() => {
    const filters: CalendarFilter[] = ["all"];
    if (canReadMeetings) filters.push("meetings");
    if (canReadTasks) filters.push("tasks");
    if (canReadTimeline) filters.push("timeline");
    return filters;
  }, [canReadMeetings, canReadTasks, canReadTimeline]);

  const goPrev = () => {
    if (prefs.view === "month") setAnchor((a) => addMonths(a, -1));
    else if (prefs.view === "week") setAnchor((a) => addDays(a, -7));
    else setAnchor((a) => addDays(a, -1));
  };

  const goNext = () => {
    if (prefs.view === "month") setAnchor((a) => addMonths(a, 1));
    else if (prefs.view === "week") setAnchor((a) => addDays(a, 7));
    else setAnchor((a) => addDays(a, 1));
  };

  const goToday = () => setAnchor(todayKey());

  const title = useMemo(() => {
    if (prefs.view === "month") return formatMonthTitle(anchor);
    if (prefs.view === "week") return formatWeekTitle(buildWeekKeys(anchor));
    if (prefs.view === "day") return formatDayTitle(anchor);
    return uiZh.calendarViewAgenda;
  }, [prefs.view, anchor]);

  if (!loaded) {
    return (
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-8 text-sm text-white/40",
        )}
      >
        {pending ? uiZh.loading : uiZh.calendarEngineDesc}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          brandGlassPanelClassName,
          "rounded-2xl px-5 py-8 text-sm text-white/50",
        )}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={brandLabelClassName}>
            <CalendarDaysIcon className="mr-1.5 inline size-3" />
            {uiZh.calendar}
          </p>
          <h1 className={cn(brandTitleClassName, "mt-2")}>{title}</h1>
          <p className={cn(brandCaptionClassName, "mt-1")}>
            {uiZh.calendarEngineDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className={brandGhostButtonClassName}
            aria-label={uiZh.calendarPrev}
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className={brandSecondaryButtonClassName}
          >
            {uiZh.calendarToday}
          </button>
          <button
            type="button"
            onClick={goNext}
            className={brandGhostButtonClassName}
            aria-label={uiZh.calendarNext}
          >
            <ChevronRightIcon className="size-4" />
          </button>
          <label className="ml-1 inline-flex items-center gap-2 text-xs text-white/40">
            <span className="sr-only">{uiZh.calendarJump}</span>
            <input
              type="date"
              value={anchor}
              onChange={(e) => {
                if (e.target.value) setAnchor(e.target.value);
              }}
              className="h-10 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white/80 outline-none focus-visible:border-white/20"
            />
          </label>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(["month", "week", "day", "agenda"] as const).map((view) => (
            <button
              key={view}
              type="button"
              disabled={view === "agenda"}
              onClick={() => updatePrefs({ view })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                prefs.view === view
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 text-white/45 hover:border-white/16 hover:text-white/75",
                view === "agenda" && "opacity-40",
              )}
              title={
                view === "agenda" ? uiZh.calendarAgendaSoon : undefined
              }
            >
              {formatCalendarView(view)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {availableFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => updatePrefs({ filter })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                prefs.filter === filter
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 text-white/45 hover:border-white/16 hover:text-white/75",
              )}
            >
              {formatCalendarFilter(filter)}
            </button>
          ))}
        </div>
      </div>

      {prefs.view === "agenda" ? (
        <div
          className={cn(
            brandGlassPanelClassName,
            "rounded-2xl px-5 py-8 text-sm text-white/45",
          )}
        >
          {uiZh.calendarAgendaSoon}
        </div>
      ) : null}

      {prefs.view === "month" ? (
        <MonthView
          anchor={anchor}
          events={events}
          onSelectDay={(date) => {
            setAnchor(date);
            updatePrefs({ view: "day" });
          }}
        />
      ) : null}

      {prefs.view === "week" ? (
        <WeekView
          anchor={anchor}
          events={events}
          onSelectDay={(date) => {
            setAnchor(date);
            updatePrefs({ view: "day" });
          }}
        />
      ) : null}

      {prefs.view === "day" ? <DayView anchor={anchor} events={events} /> : null}
    </div>
  );
}

function MonthView({
  anchor,
  events,
  onSelectDay,
}: {
  anchor: string;
  events: readonly CalendarEvent[];
  onSelectDay: (date: string) => void;
}) {
  const grid = buildMonthGrid(anchor);
  const monthPrefix = anchor.slice(0, 7);
  const today = todayKey();

  return (
    <div
      className={cn(
        brandGlassPanelClassName,
        "overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]",
      )}
    >
      <div className="grid grid-cols-7 border-b border-white/[0.06]">
        {WEEKDAY_LABELS_ZH.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[11px] tracking-wide text-white/30"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {grid.map((date) => {
          const allDayEvents = eventsForDate(events, date);
          const dayEvents = allDayEvents.slice(0, 3);
          const more = allDayEvents.length - dayEvents.length;
          const inMonth = date.startsWith(monthPrefix);
          return (
            <div
              key={date}
              className={cn(
                "min-h-[96px] border-b border-r border-white/[0.04] p-1.5 text-left",
                !inMonth && "opacity-35",
                date === today && "bg-white/[0.04]",
              )}
            >
              <button
                type="button"
                onClick={() => onSelectDay(date)}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs transition hover:bg-white/10",
                  date === today
                    ? "bg-white text-black"
                    : "text-white/55",
                )}
              >
                {Number(date.slice(8, 10))}
              </button>
              <div className="mt-1 space-y-0.5">
                {dayEvents.map((event) => (
                  <EventChip key={event.id} event={event} />
                ))}
                {more > 0 ? (
                  <button
                    type="button"
                    onClick={() => onSelectDay(date)}
                    className="px-1 text-[10px] text-white/30 hover:text-white/55"
                  >
                    +{more}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  anchor,
  events,
  onSelectDay,
}: {
  anchor: string;
  events: readonly CalendarEvent[];
  onSelectDay: (date: string) => void;
}) {
  const keys = buildWeekKeys(anchor);
  const today = todayKey();

  return (
    <div
      className={cn(
        brandGlassPanelClassName,
        "grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-7",
      )}
    >
      {keys.map((date, index) => {
        const dayEvents = eventsForDate(events, date);
        return (
          <div
            key={date}
            className={cn(
              "min-h-[180px] bg-[rgba(8,10,14,0.55)] p-2.5 backdrop-blur-xl",
              date === today && "bg-white/[0.05]",
            )}
          >
            <button
              type="button"
              onClick={() => onSelectDay(date)}
              className="mb-2 flex w-full items-baseline justify-between gap-2 text-left"
            >
              <span className="text-[11px] text-white/30">
                {WEEKDAY_LABELS_ZH[index]}
              </span>
              <span
                className={cn(
                  "text-sm",
                  date === today ? "font-semibold text-white" : "text-white/60",
                )}
              >
                {Number(date.slice(8, 10))}
              </span>
            </button>
            <div className="space-y-1.5">
              {dayEvents.length === 0 ? (
                <p className="text-[11px] text-white/20">{uiZh.emDash}</p>
              ) : (
                dayEvents.map((event) => (
                  <EventChip key={event.id} event={event} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  anchor,
  events,
}: {
  anchor: string;
  events: readonly CalendarEvent[];
}) {
  const dayEvents = eventsForDate(events, anchor);

  return (
    <div
      className={cn(
        brandGlassPanelClassName,
        "space-y-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4",
      )}
    >
      {dayEvents.length === 0 ? (
        <p className="px-1 py-6 text-sm text-white/40">{uiZh.noCalendarEvents}</p>
      ) : (
        dayEvents.map((event) => <EventRow key={event.id} event={event} />)
      )}
    </div>
  );
}
