import "server-only";

import { getCompanyById } from "@/core/company/company";
import {
  assertCompanyBoundary,
  requireCompany,
} from "@/core/company-isolation";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  clientIdSchema,
  createClientSchema,
  updateClientSchema,
  type ClientIdInput,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/core/schemas";
import type { Client, ClientStatus } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { recordClientAudit } from "@/core/client/audit";
import {
  findClientById,
  findClientsByCompany,
  findClientsByProject,
  insertClient,
  updateClientById,
} from "@/core/client/repository";

export type { CreateClientInput, UpdateClientInput, ClientIdInput };

const EDITABLE_STATUSES: ClientStatus[] = ["active", "follow_up"];

function assertEditable(client: Client): void {
  if (!EDITABLE_STATUSES.includes(client.status)) {
    throw new CoreError(
      "CLIENT_NOT_EDITABLE",
      "Archived clients cannot be edited. Restore the client first.",
    );
  }
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<string> {
  const scopedCompanyId = requireCompany(companyId);
  const company = await getCompanyById(scopedCompanyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  return scopedCompanyId;
}

async function assertProjectInCompany(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId || project.workspace_id !== workspaceId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
}

function assertClientCompanyScope(client: Client, companyId: string): void {
  assertCompanyBoundary(companyId, client.company_id);
  if (client.company_id !== requireCompany(companyId)) {
    throw new CoreError(
      "CLIENT_SCOPE_MISMATCH",
      "Client does not belong to this company.",
    );
  }
}

export type ClientMutationContext = {
  actorId: string;
};

export async function createClient(
  input: CreateClientInput,
  context?: ClientMutationContext,
): Promise<Client> {
  const values = createClientSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  const companyId = await assertCompanyInWorkspace(
    values.workspaceId,
    values.companyId,
  );

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      companyId,
      values.projectId,
    );
  }

  try {
    const client = await insertClient({
      workspace_id: values.workspaceId,
      company_id: companyId,
      project_id: values.projectId ?? null,
      owner_id: values.ownerId ?? null,
      name: values.name.trim(),
      email: values.email?.trim().toLowerCase() || null,
      phone: values.phone?.trim() || null,
      client_type: values.clientType ?? null,
      status: values.status ?? "active",
      follow_up_at: values.followUpAt ?? null,
      notes: values.notes?.trim() || null,
    });

    if (context?.actorId) {
      recordClientAudit({
        action: "create",
        actorId: context.actorId,
        before: null,
        after: client,
      });
    }

    return client;
  } catch (error) {
    console.error("createClient failed", error);
    throw new CoreError("CLIENT_CREATE_FAILED", "Failed to create client.");
  }
}

export async function getClientById(
  clientId: string,
  workspaceId?: string,
  companyId?: string,
): Promise<Client> {
  try {
    const client = await findClientById(clientId, workspaceId);
    if (!client) {
      throw new CoreError("CLIENT_NOT_FOUND", "Client not found.");
    }
    if (companyId) {
      assertClientCompanyScope(client, companyId);
    }
    return client;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getClientById failed", error);
    throw new CoreError("CLIENT_LOAD_FAILED", "Failed to load client.");
  }
}

export async function listClientsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Client[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );

  try {
    return await findClientsByCompany(workspaceId, scopedCompanyId);
  } catch (error) {
    console.error("listClientsByCompany failed", error);
    throw new CoreError("CLIENT_LIST_FAILED", "Failed to list clients.");
  }
}

export async function listClientsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Client[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );
  await assertProjectInCompany(workspaceId, scopedCompanyId, projectId);

  try {
    return await findClientsByProject(workspaceId, scopedCompanyId, projectId);
  } catch (error) {
    console.error("listClientsByProject failed", error);
    throw new CoreError("CLIENT_LIST_FAILED", "Failed to list clients.");
  }
}

export async function updateClient(
  input: UpdateClientInput,
  context?: ClientMutationContext,
): Promise<Client> {
  const values = updateClientSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getClientById(
    values.clientId,
    values.workspaceId,
    companyId,
  );

  assertEditable(before);

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      companyId,
      values.projectId,
    );
  }

  try {
    const client = await updateClientById(before.id, {
      name: values.name.trim(),
      email: values.email?.trim().toLowerCase() || null,
      phone: values.phone?.trim() || null,
      client_type: values.clientType ?? null,
      project_id:
        values.projectId !== undefined ? values.projectId : before.project_id,
      owner_id: values.ownerId !== undefined ? values.ownerId : before.owner_id,
      status: values.status ?? before.status,
      follow_up_at:
        values.followUpAt !== undefined
          ? values.followUpAt
          : before.follow_up_at,
      notes:
        values.notes !== undefined ? values.notes?.trim() || null : before.notes,
    });

    if (context?.actorId) {
      recordClientAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: client,
      });
    }

    return client;
  } catch (error) {
    console.error("updateClient failed", error);
    throw new CoreError("CLIENT_UPDATE_FAILED", "Failed to update client.");
  }
}

export async function archiveClient(
  input: ClientIdInput,
  context?: ClientMutationContext,
): Promise<Client> {
  const values = clientIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getClientById(
    values.clientId,
    values.workspaceId,
    companyId,
  );

  if (before.status === "archived") {
    return before;
  }

  try {
    const client = await updateClientById(before.id, { status: "archived" });
    if (context?.actorId) {
      recordClientAudit({
        action: "archive",
        actorId: context.actorId,
        before,
        after: client,
      });
    }
    return client;
  } catch (error) {
    console.error("archiveClient failed", error);
    throw new CoreError("CLIENT_ARCHIVE_FAILED", "Failed to archive client.");
  }
}

export async function restoreClient(
  input: ClientIdInput,
  context?: ClientMutationContext,
): Promise<Client> {
  const values = clientIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getClientById(
    values.clientId,
    values.workspaceId,
    companyId,
  );

  if (before.status !== "archived") {
    throw new CoreError(
      "CLIENT_NOT_ARCHIVED",
      "Only archived clients can be restored.",
    );
  }

  try {
    const client = await updateClientById(before.id, { status: "active" });
    if (context?.actorId) {
      recordClientAudit({
        action: "restore",
        actorId: context.actorId,
        before,
        after: client,
      });
    }
    return client;
  } catch (error) {
    console.error("restoreClient failed", error);
    throw new CoreError("CLIENT_RESTORE_FAILED", "Failed to restore client.");
  }
}

export async function markClientFollowUp(
  input: ClientIdInput,
  context?: ClientMutationContext,
): Promise<Client> {
  const values = clientIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getClientById(
    values.clientId,
    values.workspaceId,
    companyId,
  );

  if (before.status === "archived") {
    throw new CoreError(
      "CLIENT_NOT_EDITABLE",
      "Archived clients cannot be marked for follow-up. Restore first.",
    );
  }

  try {
    const client = await updateClientById(before.id, { status: "follow_up" });
    if (context?.actorId) {
      recordClientAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: client,
        metadata: { reason: "follow_up" },
      });
    }
    return client;
  } catch (error) {
    console.error("markClientFollowUp failed", error);
    throw new CoreError(
      "CLIENT_FOLLOW_UP_FAILED",
      "Failed to mark client for follow-up.",
    );
  }
}
