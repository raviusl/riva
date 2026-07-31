/**
 * Client-side persistence for Timeline Engine overrides.
 * Ready to swap for DB-backed NotificationRepository-style storage later.
 */

import type { MilestoneKind } from "@/features/timeline-engine/defaults";
import type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";

export type MilestoneOverride = {
  status?: TimelineMilestoneStatus;
  date?: string | null;
  description?: string | null;
  ownerId?: string | null;
  title?: string;
};

export type CustomMilestoneSeed = {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  status: TimelineMilestoneStatus;
  ownerId: string | null;
  sequence: number;
  kind: "custom";
};

export type ProjectTimelineLocalState = {
  overrides: Record<string, MilestoneOverride>;
  custom: CustomMilestoneSeed[];
};

const STORAGE_PREFIX = "riva.timeline-engine.v1";

function storageKey(companyId: string, projectId: string) {
  return `${STORAGE_PREFIX}:${companyId}:${projectId}`;
}

export function emptyTimelineLocalState(): ProjectTimelineLocalState {
  return { overrides: {}, custom: [] };
}

export function readTimelineLocalState(
  companyId: string,
  projectId: string,
): ProjectTimelineLocalState {
  if (typeof window === "undefined") {
    return emptyTimelineLocalState();
  }
  try {
    const raw = window.localStorage.getItem(storageKey(companyId, projectId));
    if (!raw) return emptyTimelineLocalState();
    const parsed = JSON.parse(raw) as ProjectTimelineLocalState;
    return {
      overrides: parsed.overrides ?? {},
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
    };
  } catch {
    return emptyTimelineLocalState();
  }
}

export function writeTimelineLocalState(
  companyId: string,
  projectId: string,
  state: ProjectTimelineLocalState,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(companyId, projectId),
      JSON.stringify(state),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function patchMilestoneOverride(
  state: ProjectTimelineLocalState,
  milestoneId: string,
  patch: MilestoneOverride,
): ProjectTimelineLocalState {
  return {
    ...state,
    overrides: {
      ...state.overrides,
      [milestoneId]: {
        ...state.overrides[milestoneId],
        ...patch,
      },
    },
  };
}

export function milestoneSeedKey(
  kind: MilestoneKind,
  projectId: string,
): string {
  return `${kind}:${projectId}`;
}
