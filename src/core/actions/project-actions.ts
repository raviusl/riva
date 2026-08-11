"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import {
  activateProject,
  archiveProject,
  createProject,
  deleteProject,
  restoreProject,
  updateProject,
} from "@/core/project/project";
import type {
  CreateProjectInput,
  ProjectIdInput,
  UpdateProjectInput,
} from "@/core/schemas";

export type ProjectActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateProjectPaths(projectId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`);
    revalidatePath(`/dashboard/projects/${projectId}/edit`);
  }
}

async function requireProjectWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "project.write",
  );
}

export async function createProjectAction(
  input: CreateProjectInput,
): Promise<ProjectActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireProjectWrite(userId, input.workspaceId, input.companyId);
    const project = await createProject({
      ...input,
      ownerId: input.ownerId ?? userId,
    });
    revalidateProjectPaths(project.id);
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create project"),
    };
  }
}

export async function updateProjectAction(
  input: UpdateProjectInput,
): Promise<ProjectActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireProjectWrite(userId, input.workspaceId, input.companyId);
    const project = await updateProject(input);
    revalidateProjectPaths(project.id);
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update project"),
    };
  }
}

export async function archiveProjectAction(
  input: ProjectIdInput,
): Promise<ProjectActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireProjectWrite(userId, input.workspaceId, input.companyId);
    const project = await archiveProject(input);
    revalidateProjectPaths(project.id);
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive project"),
    };
  }
}

export async function deleteProjectAction(
  input: ProjectIdInput,
): Promise<ProjectActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireProjectWrite(userId, input.workspaceId, input.companyId);
    const project = await deleteProject(input);
    revalidateProjectPaths(project.id);
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to delete project"),
    };
  }
}

export async function restoreProjectAction(
  input: ProjectIdInput,
): Promise<ProjectActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireProjectWrite(userId, input.workspaceId, input.companyId);
    const project = await restoreProject(input);
    revalidateProjectPaths(project.id);
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore project"),
    };
  }
}

export async function activateProjectAction(
  input: ProjectIdInput,
): Promise<ProjectActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireProjectWrite(userId, input.workspaceId, input.companyId);
    const project = await activateProject(input);
    revalidateProjectPaths(project.id);
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to activate project"),
    };
  }
}
