"use server";

import { requireSessionContext } from "@/core/auth/context";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { listMeetingsByProject } from "@/core/meeting/meeting";
import { getProjectById } from "@/core/project/project";
import { listTasksByProject } from "@/core/task/service";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";
import { buildProjectTimeline } from "@/features/timeline-engine/build-timeline";
import type { ProjectTimelineEngine } from "@/features/timeline-engine/types";

export type LoadProjectTimelineResult =
  | {
      ok: true;
      data: {
        timeline: ProjectTimelineEngine;
        canWrite: boolean;
      };
    }
  | { ok: false; error: string };

type LoadInput = {
  workspaceId: string;
  companyId: string;
  projectId: string;
};

/**
 * Load project-owned Timeline Engine.
 * Requires project.read + timeline.read; company isolation enforced.
 */
export async function loadProjectTimelineAction(
  input: LoadInput,
): Promise<LoadProjectTimelineResult> {
  try {
    const context = await requireSessionContext();
    if (
      context.workspace.id !== input.workspaceId ||
      context.company.id !== input.companyId
    ) {
      throw new CoreError(
        "TIMELINE_SCOPE_MISMATCH",
        "Timeline is limited to the active company.",
      );
    }

    if (!context.permissions.has("project.read")) {
      throw new CoreError(
        "PERMISSION_DENIED",
        "Missing permission: project.read",
      );
    }

    if (!context.permissions.has("timeline.read")) {
      throw new CoreError(
        "PERMISSION_DENIED",
        "Missing permission: timeline.read",
      );
    }

    const project = await getProjectById(
      input.projectId,
      context.workspace.id,
    );

    if (project.company_id !== context.company.id) {
      throw new CoreError(
        "TIMELINE_SCOPE_MISMATCH",
        "Timeline is limited to the active company.",
      );
    }

    const [tasks, meetings, owners] = await Promise.all([
      context.permissions.has("task.read")
        ? listTasksByProject(
            context.workspace.id,
            context.company.id,
            project.id,
          )
        : Promise.resolve([]),
      context.permissions.has("meeting.read")
        ? listMeetingsByProject(
            context.workspace.id,
            context.company.id,
            project.id,
          )
        : Promise.resolve([]),
      listClientOwnerOptions(context.workspace.id, context.company.id),
    ]);

    const timeline = buildProjectTimeline({
      project,
      tasks,
      meetings,
      projectOwnerName: ownerLabelFromOptions(project.owner_id, owners),
    });

    return {
      ok: true,
      data: {
        timeline,
        canWrite:
          context.permissions.has("timeline.write") &&
          context.permissions.has("project.write"),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load timeline"),
    };
  }
}
