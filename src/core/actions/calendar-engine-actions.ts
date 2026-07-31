"use server";

import { requireSessionContext } from "@/core/auth/context";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import { listProjectsByCompany } from "@/core/project/project";
import { listTasks } from "@/core/task/service";
import { deriveCalendarEvents } from "@/features/calendar-engine/derive-calendar";
import type { CalendarEvent } from "@/features/calendar-engine/types";
import type { Meeting } from "@/core/meeting/types";
import type { Project } from "@/core/types";
import type { Task } from "@/core/task/types";
import type { TimelineMilestoneProjection } from "@/core/timeline/projections";
import { buildCompanyMilestoneProjections } from "@/features/timeline-engine/build-projections";

export type LoadCompanyCalendarResult =
  | {
      ok: true;
      data: {
        events: CalendarEvent[];
        meetings: Meeting[];
        tasks: Task[];
        projects: Project[];
        milestones: TimelineMilestoneProjection[];
        canReadMeetings: boolean;
        canReadTasks: boolean;
        canReadTimeline: boolean;
      };
    }
  | { ok: false; error: string };

type LoadInput = {
  workspaceId: string;
  companyId: string;
};

/**
 * Load company-scoped Calendar Engine feed.
 * Presentation aggregation only — permissions gate each source.
 */
export async function loadCompanyCalendarAction(
  input: LoadInput,
): Promise<LoadCompanyCalendarResult> {
  try {
    const context = await requireSessionContext();
    if (
      context.workspace.id !== input.workspaceId ||
      context.company.id !== input.companyId
    ) {
      throw new CoreError(
        "CALENDAR_SCOPE_MISMATCH",
        "Calendar is limited to the active company.",
      );
    }

    const canReadMeetings = context.permissions.has("meeting.read");
    const canReadTasks = context.permissions.has("task.read");
    const canReadProjects = context.permissions.has("project.read");
    const canReadTimeline = context.permissions.has("timeline.read");

    if (!canReadMeetings && !canReadTasks && !canReadTimeline) {
      throw new CoreError(
        "PERMISSION_DENIED",
        "Missing permission to view calendar sources.",
      );
    }

    const [meetings, tasks, projects] = await Promise.all([
      canReadMeetings
        ? listMeetingsByCompany(input.workspaceId, input.companyId)
        : Promise.resolve([]),
      canReadTasks
        ? listTasks({
            workspaceId: input.workspaceId,
            companyId: input.companyId,
            includeArchived: false,
          })
        : Promise.resolve([]),
      canReadProjects || canReadTimeline
        ? listProjectsByCompany(input.workspaceId, input.companyId)
        : Promise.resolve([]),
    ]);

    const milestones = canReadTimeline
      ? buildCompanyMilestoneProjections({
          projects,
          tasks: canReadTasks ? tasks : [],
          meetings: canReadMeetings ? meetings : [],
        })
      : [];

    const events = deriveCalendarEvents({
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      meetings: canReadMeetings ? meetings : [],
      tasks: canReadTasks ? tasks : [],
      projects: canReadTimeline ? projects : [],
      milestones,
      filter: "all",
    });

    return {
      ok: true,
      data: {
        events,
        meetings,
        tasks,
        projects,
        milestones,
        canReadMeetings,
        canReadTasks,
        canReadTimeline,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load calendar"),
    };
  }
}
