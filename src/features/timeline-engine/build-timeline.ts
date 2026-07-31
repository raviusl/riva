/**
 * Single Timeline Engine builder (Project 077).
 * One project → one ordered lifecycle timeline.
 * Relates existing Tasks / Meetings — does not duplicate scheduling.
 */

import type { Meeting } from "@/core/meeting/types";
import type { Project } from "@/core/types";
import type { Task } from "@/core/task/types";
import {
  DEFAULT_MILESTONE_KINDS,
  type DefaultMilestoneKind,
} from "@/features/timeline-engine/defaults";
import { uuidFromSeed } from "@/features/timeline-engine/id";
import {
  defaultMilestoneDescription,
  defaultMilestoneTitle,
} from "@/features/timeline-engine/labels";
import type {
  CustomMilestoneSeed,
  MilestoneOverride,
  ProjectTimelineLocalState,
} from "@/features/timeline-engine/local-state";
import { calculateTimelineProgress } from "@/features/timeline-engine/progress";
import type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";
import type {
  ProjectTimelineEngine,
  TimelineMilestoneItem,
  TimelineRelatedMeeting,
  TimelineRelatedTask,
} from "@/features/timeline-engine/types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export type BuildProjectTimelineInput = {
  project: Project;
  tasks?: readonly Task[];
  meetings?: readonly Meeting[];
  local?: ProjectTimelineLocalState;
  /** Display name for project.owner_id when used as milestone owner. */
  projectOwnerName?: string | null;
};

function dayKey(isoOrDate: string | null | undefined): string | null {
  if (!isoOrDate) return null;
  return isoOrDate.slice(0, 10);
}

function defaultStatusForIndex(index: number): TimelineMilestoneStatus {
  return index === 0 ? "active" : "pending";
}

function seedMilestoneId(
  projectId: string,
  kind: DefaultMilestoneKind | "custom",
  customId?: string,
): string {
  if (kind === "custom" && customId) return customId;
  return uuidFromSeed(`timeline-milestone|${projectId}|${kind}`);
}

function mapTask(task: Task): TimelineRelatedTask {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    href: buildWorkspaceOverviewHref("task", task.id),
  };
}

function mapMeeting(meeting: Meeting): TimelineRelatedMeeting {
  return {
    id: meeting.id,
    title: meeting.title,
    status: meeting.status,
    startsAt: meeting.starts_at,
    href: buildWorkspaceOverviewHref("meeting", meeting.id),
  };
}

/**
 * Assign related entities into milestone windows by date.
 * Falls back to the Active milestone (or first Pending) when undated.
 */
function assignRelated(
  milestones: TimelineMilestoneItem[],
  tasks: readonly Task[],
  meetings: readonly Meeting[],
): TimelineMilestoneItem[] {
  const buckets = milestones.map((m) => ({
    tasks: [] as TimelineRelatedTask[],
    meetings: [] as TimelineRelatedMeeting[],
  }));

  const dated = milestones
    .map((m, index) => ({ index, date: dayKey(m.date) }))
    .filter((x): x is { index: number; date: string } => Boolean(x.date))
    .sort((a, b) => a.date.localeCompare(b.date));

  const fallbackIndex = (() => {
    const active = milestones.findIndex((m) => m.status === "active");
    if (active >= 0) return active;
    const pending = milestones.findIndex((m) => m.status === "pending");
    return pending >= 0 ? pending : 0;
  })();

  function indexForDate(date: string | null): number {
    if (!date || dated.length === 0) return fallbackIndex;
    let chosen = dated[0]!.index;
    for (const entry of dated) {
      if (date >= entry.date) chosen = entry.index;
      else break;
    }
    return chosen;
  }

  for (const task of tasks) {
    const idx = indexForDate(dayKey(task.dueDate ?? task.startDate));
    buckets[idx]?.tasks.push(mapTask(task));
  }

  for (const meeting of meetings) {
    const idx = indexForDate(
      dayKey(meeting.starts_at) ?? dayKey(meeting.meeting_date),
    );
    buckets[idx]?.meetings.push(mapMeeting(meeting));
  }

  return milestones.map((m, i) => ({
    ...m,
    relatedTasks: buckets[i]?.tasks ?? [],
    relatedMeetings: buckets[i]?.meetings ?? [],
  }));
}

function applyOverride(
  base: TimelineMilestoneItem,
  override: MilestoneOverride | undefined,
): TimelineMilestoneItem {
  if (!override) return base;
  return {
    ...base,
    title: override.title ?? base.title,
    description:
      override.description !== undefined
        ? override.description
        : base.description,
    date: override.date !== undefined ? override.date : base.date,
    status: override.status ?? base.status,
    ownerId: override.ownerId !== undefined ? override.ownerId : base.ownerId,
  };
}

function buildCustomMilestone(
  seed: CustomMilestoneSeed,
  project: Project,
  projectOwnerName: string | null,
): TimelineMilestoneItem {
  const ownerId = seed.ownerId ?? project.owner_id;
  return {
    id: seed.id,
    kind: "custom",
    title: seed.title,
    description: seed.description,
    date: seed.date,
    status: seed.status,
    ownerId,
    ownerName: ownerId === project.owner_id ? projectOwnerName : null,
    sequence: seed.sequence,
    relatedTasks: [],
    relatedMeetings: [],
  };
}

/**
 * Build the project-owned Timeline Engine view.
 */
export function buildProjectTimeline(
  input: BuildProjectTimelineInput,
): ProjectTimelineEngine {
  const {
    project,
    tasks = [],
    meetings = [],
    local = { overrides: {}, custom: [] },
    projectOwnerName = null,
  } = input;

  const defaultMilestones: TimelineMilestoneItem[] =
    DEFAULT_MILESTONE_KINDS.map((kind, index) => {
      const id = seedMilestoneId(project.id, kind);
      const base: TimelineMilestoneItem = {
        id,
        kind,
        title: defaultMilestoneTitle(kind),
        description: defaultMilestoneDescription(kind),
        date: null,
        status: defaultStatusForIndex(index),
        ownerId: project.owner_id,
        ownerName: projectOwnerName,
        sequence: index,
        relatedTasks: [],
        relatedMeetings: [],
      };
      return applyOverride(base, local.overrides[id]);
    });

  const customStart = defaultMilestones.length;
  const customMilestones = local.custom.map((seed, i) => {
    const built = buildCustomMilestone(
      { ...seed, sequence: seed.sequence ?? customStart + i },
      project,
      projectOwnerName,
    );
    return applyOverride(built, local.overrides[built.id]);
  });

  const ordered = [...defaultMilestones, ...customMilestones].sort(
    (a, b) => a.sequence - b.sequence,
  );

  // Ensure at most one Active: prefer explicit overrides; else first non-terminal.
  const activeCount = ordered.filter((m) => m.status === "active").length;
  let normalized = ordered;
  if (activeCount === 0) {
    const next = ordered.findIndex(
      (m) => m.status === "pending" || m.status === "active",
    );
    if (next >= 0) {
      normalized = ordered.map((m, i) =>
        i === next ? { ...m, status: "active" as const } : m,
      );
    }
  } else if (activeCount > 1) {
    let seen = false;
    normalized = ordered.map((m) => {
      if (m.status !== "active") return m;
      if (!seen) {
        seen = true;
        return m;
      }
      return { ...m, status: "pending" as const };
    });
  }

  const withRelated = assignRelated(
    normalized,
    tasks.filter((t) => t.relatedProjectId === project.id && !t.archivedAt),
    meetings.filter((m) => m.project_id === project.id),
  );

  const progress = calculateTimelineProgress(withRelated);

  return {
    projectId: project.id,
    companyId: project.company_id,
    workspaceId: project.workspace_id,
    milestones: withRelated,
    ...progress,
  };
}
