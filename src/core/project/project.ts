import "server-only";

import { getCompanyById } from "@/core/company/company";
import { updateClient } from "@/core/client/client";
import { getClientById } from "@/core/client/client";
import { CoreError } from "@/core/errors";
import {
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type ProjectIdInput,
  type UpdateProjectInput,
} from "@/core/schemas";
import type { Project, ProjectStatus } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import {
  findProjectById,
  findProjectsByCompany,
  findProjectsByWorkspace,
  insertProject,
  updateProjectById,
} from "@/core/project/repository";

export type { CreateProjectInput, UpdateProjectInput, ProjectIdInput };

const EDITABLE_STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "completed",
];

function assertEditable(project: Project): void {
  if (!EDITABLE_STATUSES.includes(project.status)) {
    throw new CoreError(
      "PROJECT_NOT_EDITABLE",
      "Archived projects cannot be edited. Restore the project first.",
    );
  }
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<void> {
  const company = await getCompanyById(companyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const values = createProjectSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  await assertCompanyInWorkspace(values.workspaceId, values.companyId);

  try {
    const project = await insertProject({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      project_type: values.projectType ?? null,
      status: values.status ?? "planning",
      owner_id: values.ownerId ?? null,
      start_date: values.startDate || null,
      end_date: values.endDate || null,
    });

    if (values.clientId) {
      const client = await getClientById(
        values.clientId,
        values.workspaceId,
        values.companyId,
      );
      const actorId = values.ownerId;
      await updateClient(
        {
          workspaceId: values.workspaceId,
          companyId: values.companyId,
          clientId: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          projectId: project.id,
          ownerId: client.owner_id,
          clientType: client.client_type,
          status: client.status,
          followUpAt: client.follow_up_at,
          notes: client.notes,
        },
        actorId ? { actorId } : undefined,
      );
    }

    return project;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("createProject failed", error);
    throw new CoreError("PROJECT_CREATE_FAILED", "Failed to create project.");
  }
}

export async function getProjectById(
  projectId: string,
  workspaceId?: string,
): Promise<Project> {
  try {
    const project = await findProjectById(projectId, workspaceId);
    if (!project) {
      throw new CoreError("PROJECT_NOT_FOUND", "Project not found.");
    }
    return project;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getProjectById failed", error);
    throw new CoreError("PROJECT_LOAD_FAILED", "Failed to load project.");
  }
}

export async function listProjectsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Project[]> {
  await getWorkspaceById(workspaceId);
  await assertCompanyInWorkspace(workspaceId, companyId);

  try {
    return await findProjectsByCompany(workspaceId, companyId);
  } catch (error) {
    console.error("listProjectsByCompany failed", error);
    throw new CoreError("PROJECT_LIST_FAILED", "Failed to list projects.");
  }
}

export async function listProjectsByWorkspace(
  workspaceId: string,
): Promise<Project[]> {
  await getWorkspaceById(workspaceId);

  try {
    return await findProjectsByWorkspace(workspaceId);
  } catch (error) {
    console.error("listProjectsByWorkspace failed", error);
    throw new CoreError("PROJECT_LIST_FAILED", "Failed to list projects.");
  }
}

export async function updateProject(input: UpdateProjectInput): Promise<Project> {
  const values = updateProjectSchema.parse(input);
  const project = await getProjectById(values.projectId, values.workspaceId);

  if (
    project.company_id !== values.companyId ||
    project.workspace_id !== values.workspaceId
  ) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }

  assertEditable(project);

  try {
    return await updateProjectById(project.id, {
      name: values.name.trim(),
      description:
        values.description !== undefined
          ? values.description?.trim() || null
          : project.description,
      project_type: values.projectType ?? null,
      status: values.status ?? project.status,
      owner_id: values.ownerId !== undefined ? values.ownerId : project.owner_id,
      start_date:
        values.startDate !== undefined ? values.startDate : project.start_date,
      end_date: values.endDate !== undefined ? values.endDate : project.end_date,
    });
  } catch (error) {
    console.error("updateProject failed", error);
    throw new CoreError("PROJECT_UPDATE_FAILED", "Failed to update project.");
  }
}

export async function archiveProject(input: ProjectIdInput): Promise<Project> {
  const values = projectIdSchema.parse(input);
  const project = await getProjectById(values.projectId, values.workspaceId);

  if (project.company_id !== values.companyId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
  if (project.status === "archived") {
    return project;
  }

  try {
    return await updateProjectById(project.id, { status: "archived" });
  } catch (error) {
    console.error("archiveProject failed", error);
    throw new CoreError(
      "PROJECT_ARCHIVE_FAILED",
      "Failed to archive project.",
    );
  }
}

export async function restoreProject(input: ProjectIdInput): Promise<Project> {
  const values = projectIdSchema.parse(input);
  const project = await getProjectById(values.projectId, values.workspaceId);

  if (project.company_id !== values.companyId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
  if (project.status !== "archived") {
    throw new CoreError(
      "PROJECT_NOT_ARCHIVED",
      "Only archived projects can be restored.",
    );
  }

  try {
    return await updateProjectById(project.id, { status: "planning" });
  } catch (error) {
    console.error("restoreProject failed", error);
    throw new CoreError(
      "PROJECT_RESTORE_FAILED",
      "Failed to restore project.",
    );
  }
}

export async function activateProject(input: ProjectIdInput): Promise<Project> {
  const values = projectIdSchema.parse(input);
  const project = await getProjectById(values.projectId, values.workspaceId);

  if (project.company_id !== values.companyId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
  if (project.status === "archived") {
    throw new CoreError(
      "PROJECT_NOT_EDITABLE",
      "Archived projects cannot be activated. Restore first.",
    );
  }
  if (project.status === "active") {
    return project;
  }

  try {
    return await updateProjectById(project.id, { status: "active" });
  } catch (error) {
    console.error("activateProject failed", error);
    throw new CoreError(
      "PROJECT_ACTIVATE_FAILED",
      "Failed to activate project.",
    );
  }
}
