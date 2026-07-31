/**
 * Single Calendar Engine feed aggregator (Project 078 / 088).
 * Presentation layer only — consumes Meeting, Task, and milestone projections.
 * Does not import Timeline Engine (projections injected by orchestrator).
 */

import type { Meeting } from "@/core/meeting/types";
import type { TimelineMilestoneProjection } from "@/core/timeline/projections";
import type { Project } from "@/core/types";
import type { Task } from "@/core/task/types";
import {
  extractTimeFromIso,
  toDateKey,
} from "@/features/calendar-engine/date-utils";
import { uuidFromSeed } from "@/features/calendar-engine/id";
import type { CalendarFilter } from "@/features/calendar-engine/kinds";
import type { CalendarEvent } from "@/features/calendar-engine/types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export type DeriveCalendarInput = {
  companyId: string;
  workspaceId: string;
  meetings?: readonly Meeting[];
  tasks?: readonly Task[];
  projects?: readonly Project[];
  /** Neutral milestone projections — do not import Timeline Engine here. */
  milestones?: readonly TimelineMilestoneProjection[];
  filter?: CalendarFilter;
};

function projectNameMap(projects: readonly Project[]) {
  return new Map(projects.map((p) => [p.id, p.name]));
}

function fromMeeting(
  meeting: Meeting,
  names: Map<string, string>,
): CalendarEvent | null {
  const date = toDateKey(meeting.starts_at || meeting.meeting_date);
  if (!date) return null;
  const time =
    meeting.meeting_time?.slice(0, 5) ||
    extractTimeFromIso(meeting.starts_at);
  return {
    id: uuidFromSeed(`cal|meeting|${meeting.id}`),
    kind: "meeting",
    title: meeting.title,
    date,
    time,
    occursAt: meeting.starts_at || `${date}T${time ?? "00:00"}:00`,
    status: meeting.status,
    relatedProjectId: meeting.project_id,
    relatedProjectName: meeting.project_id
      ? (names.get(meeting.project_id) ?? null)
      : null,
    href: buildWorkspaceOverviewHref("meeting", meeting.id),
    sourceId: meeting.id,
  };
}

function fromTask(
  task: Task,
  names: Map<string, string>,
): CalendarEvent | null {
  if (!task.dueDate) return null;
  const date = toDateKey(task.dueDate);
  return {
    id: uuidFromSeed(`cal|task|${task.id}`),
    kind: "task",
    title: task.title,
    date,
    time: null,
    occursAt: `${date}T23:59:00`,
    status: task.status,
    relatedProjectId: task.relatedProjectId,
    relatedProjectName: task.relatedProjectId
      ? (names.get(task.relatedProjectId) ?? null)
      : null,
    href: buildWorkspaceOverviewHref("task", task.id),
    sourceId: task.id,
  };
}

function fromMilestones(
  milestones: readonly TimelineMilestoneProjection[],
  companyId: string,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const milestone of milestones) {
    if (milestone.companyId !== companyId) continue;
    if (!milestone.date) continue;
    const date = toDateKey(milestone.date);
    events.push({
      id: uuidFromSeed(`cal|milestone|${milestone.id}`),
      kind: "milestone",
      title: milestone.title,
      date,
      time: null,
      occursAt: `${date}T09:00:00`,
      status: milestone.status,
      relatedProjectId: milestone.projectId,
      relatedProjectName: milestone.projectName,
      href: `/dashboard/projects/${milestone.projectId}`,
      sourceId: milestone.id,
    });
  }
  return events;
}

function matchesFilter(
  event: CalendarEvent,
  filter: CalendarFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "meetings") return event.kind === "meeting";
  if (filter === "tasks") return event.kind === "task";
  if (filter === "timeline") return event.kind === "milestone";
  return true;
}

/**
 * Derive company calendar events from existing domain entities + projections.
 */
export function deriveCalendarEvents(
  input: DeriveCalendarInput,
): CalendarEvent[] {
  const {
    meetings = [],
    tasks = [],
    projects = [],
    milestones = [],
    filter = "all",
  } = input;

  const names = projectNameMap(projects);
  const events: CalendarEvent[] = [];

  for (const meeting of meetings) {
    if (meeting.company_id !== input.companyId) continue;
    const event = fromMeeting(meeting, names);
    if (event) events.push(event);
  }

  for (const task of tasks) {
    if (task.companyId !== input.companyId) continue;
    if (task.archivedAt) continue;
    const event = fromTask(task, names);
    if (event) events.push(event);
  }

  if (filter === "all" || filter === "timeline") {
    events.push(...fromMilestones(milestones, input.companyId));
  }

  return events
    .filter((e) => matchesFilter(e, filter))
    .sort((a, b) => {
      const byOccurs = a.occursAt.localeCompare(b.occursAt);
      if (byOccurs !== 0) return byOccurs;
      return a.title.localeCompare(b.title, "zh-CN");
    });
}

export function eventsForDate(
  events: readonly CalendarEvent[],
  date: string,
): CalendarEvent[] {
  return events.filter((e) => e.date === date);
}
