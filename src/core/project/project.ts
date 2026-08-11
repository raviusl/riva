import "server-only";

import { getCompanyById } from "@/core/company/company";
import { updateClientById, findClientById } from "@/core/client/repository";
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
  findProjectsByClient,
  findProjectsByCompany,
  findProjectsByWorkspace,
  insertProject,
  updateProjectById,
} from "@/core/project/repository";

export type { CreateProjectInput, UpdateProjectInput, ProjectIdInput };

const EDITABLE_STATUSES: ProjectStatus[] = [
  "inquiry",
  "proposal",
  "confirmed",
  "planning",
  "execution",
  "completed",
  "cancelled",
];

function assertEditable(project: Project): void {
  if (!EDITABLE_STATUSES.includes(project.status)) {
    throw new CoreError(
      "PROJECT_NOT_EDITABLE",
      "Archived projects cannot be edited. Restore the project first.",
    );
  }
}

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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

async function linkClientToProject(input: {
  workspaceId: string;
  companyId: string;
  clientId: string;
  projectId: string;
}): Promise<void> {
  const client = await getClientById(
    input.clientId,
    input.workspaceId,
    input.companyId,
  );
  await updateClientById(client.id, { project_id: input.projectId });
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const values = createProjectSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  await assertCompanyInWorkspace(values.workspaceId, values.companyId);

  if (values.clientId) {
    await getClientById(
      values.clientId,
      values.workspaceId,
      values.companyId,
    );
  }

  try {
    let project = await insertProject({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      client_id: values.clientId ?? null,
      name: values.name.trim(),
      project_code: trimOrNull(values.projectCode),
      description: trimOrNull(values.description),
      project_type: values.projectType ?? null,
      status: values.status ?? "inquiry",
      owner_id: values.ownerId ?? null,
      coordinator_id: values.coordinatorId ?? null,
      sales_id: values.salesId ?? null,
      planner_id: values.plannerId ?? null,
      start_date: values.startDate || null,
      end_date: values.endDate || null,
      wedding_date: values.weddingDate || null,
      event_date: values.eventDate || values.weddingDate || null,
      venue: trimOrNull(values.venue),
      ballroom: trimOrNull(values.ballroom),
      session: values.session ?? null,
      package_name: trimOrNull(values.packageName),
      expected_pax: values.expectedPax ?? null,
      client_budget: values.clientBudget ?? null,
      theme: trimOrNull(values.theme),
      dress_code: trimOrNull(values.dressCode),
      notes: trimOrNull(values.notes),
    });

    if (!project.project_code) {
      project = await updateProjectById(project.id, {
        project_code: `PRJ-${project.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
      });
    }

    if (values.clientId) {
      await linkClientToProject({
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        clientId: values.clientId,
        projectId: project.id,
      });
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

export async function listProjectsByClient(
  workspaceId: string,
  companyId: string,
  clientId: string,
): Promise<Project[]> {
  await getWorkspaceById(workspaceId);
  await assertCompanyInWorkspace(workspaceId, companyId);
  await getClientById(clientId, workspaceId, companyId);

  try {
    return await findProjectsByClient(workspaceId, companyId, clientId);
  } catch (error) {
    console.error("listProjectsByClient failed", error);
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

  if (values.clientId) {
    await getClientById(
      values.clientId,
      values.workspaceId,
      values.companyId,
    );
  }

  try {
    const updated = await updateProjectById(project.id, {
      name: values.name.trim(),
      client_id:
        values.clientId !== undefined ? values.clientId : project.client_id,
      project_code:
        values.projectCode !== undefined
          ? trimOrNull(values.projectCode)
          : project.project_code,
      description:
        values.description !== undefined
          ? trimOrNull(values.description)
          : project.description,
      project_type:
        values.projectType !== undefined
          ? values.projectType
          : project.project_type,
      status: values.status ?? project.status,
      owner_id: values.ownerId !== undefined ? values.ownerId : project.owner_id,
      coordinator_id:
        values.coordinatorId !== undefined
          ? values.coordinatorId
          : project.coordinator_id,
      sales_id:
        values.salesId !== undefined ? values.salesId : project.sales_id,
      planner_id:
        values.plannerId !== undefined ? values.plannerId : project.planner_id,
      start_date:
        values.startDate !== undefined ? values.startDate : project.start_date,
      end_date: values.endDate !== undefined ? values.endDate : project.end_date,
      wedding_date:
        values.weddingDate !== undefined
          ? values.weddingDate
          : project.wedding_date,
      event_date:
        values.eventDate !== undefined ? values.eventDate : project.event_date,
      venue:
        values.venue !== undefined ? trimOrNull(values.venue) : project.venue,
      ballroom:
        values.ballroom !== undefined
          ? trimOrNull(values.ballroom)
          : project.ballroom,
      session: values.session !== undefined ? values.session : project.session,
      package_name:
        values.packageName !== undefined
          ? trimOrNull(values.packageName)
          : project.package_name,
      expected_pax:
        values.expectedPax !== undefined
          ? values.expectedPax
          : project.expected_pax,
      client_budget:
        values.clientBudget !== undefined
          ? values.clientBudget
          : project.client_budget,
      theme:
        values.theme !== undefined ? trimOrNull(values.theme) : project.theme,
      dress_code:
        values.dressCode !== undefined
          ? trimOrNull(values.dressCode)
          : project.dress_code,
      notes:
        values.notes !== undefined ? trimOrNull(values.notes) : project.notes,
    });

    if (values.clientId) {
      await linkClientToProject({
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        clientId: values.clientId,
        projectId: updated.id,
      });
    }

    return updated;
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

/** Soft-delete via archive so history remains recoverable. */
export async function deleteProject(input: ProjectIdInput): Promise<Project> {
  const values = projectIdSchema.parse(input);
  const project = await getProjectById(values.projectId, values.workspaceId);

  if (project.company_id !== values.companyId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }

  try {
    if (project.status === "archived") {
      return project;
    }
    return await updateProjectById(project.id, { status: "archived" });
  } catch (error) {
    console.error("deleteProject failed", error);
    throw new CoreError("PROJECT_DELETE_FAILED", "Failed to delete project.");
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

/** Move project into Execution stage (legacy “activate”). */
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
  if (project.status === "execution") {
    return project;
  }

  try {
    return await updateProjectById(project.id, { status: "execution" });
  } catch (error) {
    console.error("activateProject failed", error);
    throw new CoreError(
      "PROJECT_ACTIVATE_FAILED",
      "Failed to activate project.",
    );
  }
}

/** Resolve primary client for a project (projects.client_id or reverse link). */
export async function getProjectPrimaryClient(
  project: Project,
): Promise<Awaited<ReturnType<typeof findClientById>>> {
  if (project.client_id) {
    return findClientById(project.client_id, project.workspace_id);
  }
  return null;
}
