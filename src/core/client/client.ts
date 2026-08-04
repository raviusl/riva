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
  type InsertClientRow,
  type UpdateClientRow,
} from "@/core/client/repository";

export type { CreateClientInput, UpdateClientInput, ClientIdInput };

const EDITABLE_STATUSES: ClientStatus[] = [
  "inquiry",
  "follow_up",
  "confirmed",
  "completed",
  "cancelled",
];

function assertEditable(client: Client): void {
  if (!EDITABLE_STATUSES.includes(client.status)) {
    throw new CoreError(
      "CLIENT_NOT_EDITABLE",
      "Archived clients cannot be edited. Restore the client first.",
    );
  }
}

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function resolveDisplayName(input: {
  displayName?: string | null;
  brideName?: string | null;
  groomName?: string | null;
  name: string;
}): string | null {
  const explicit = trimOrNull(input.displayName);
  if (explicit) return explicit;
  const couple = [trimOrNull(input.brideName), trimOrNull(input.groomName)]
    .filter(Boolean)
    .join(" & ");
  return couple || null;
}

function toInsertRow(
  values: CreateClientInput,
  companyId: string,
): InsertClientRow {
  return {
    workspace_id: values.workspaceId,
    company_id: companyId,
    project_id: values.projectId ?? null,
    owner_id: values.ownerId ?? values.leadOwnerId ?? null,
    lead_owner_id: values.leadOwnerId ?? values.ownerId ?? null,
    assigned_pic_id: values.assignedPicId ?? null,
    client_code: trimOrNull(values.clientCode),
    name: values.name.trim(),
    company_name: trimOrNull(values.companyName),
    bride_name: trimOrNull(values.brideName),
    groom_name: trimOrNull(values.groomName),
    display_name: resolveDisplayName({
      displayName: values.displayName,
      brideName: values.brideName,
      groomName: values.groomName,
      name: values.name,
    }),
    contact_person: trimOrNull(values.contactPerson),
    email: values.email?.trim().toLowerCase() || null,
    phone: trimOrNull(values.phone),
    whatsapp: trimOrNull(values.whatsapp),
    instagram: trimOrNull(values.instagram),
    facebook: trimOrNull(values.facebook),
    home_address: trimOrNull(values.homeAddress),
    city: trimOrNull(values.city),
    state: trimOrNull(values.state),
    country: trimOrNull(values.country),
    birthday: values.birthday ?? null,
    anniversary: values.anniversary ?? null,
    client_type: values.clientType ?? null,
    status: values.status ?? "inquiry",
    is_active: values.isActive ?? true,
    source: values.source ?? null,
    follow_up_at: values.followUpAt ?? null,
    wedding_date: values.weddingDate ?? null,
    wedding_type: trimOrNull(values.weddingType),
    session: values.session ?? null,
    include_rom: values.includeRom ?? false,
    include_lunch: values.includeLunch ?? false,
    include_dinner: values.includeDinner ?? false,
    venue: trimOrNull(values.venue),
    ballroom: trimOrNull(values.ballroom),
    expected_pax: values.expectedPax ?? null,
    theme: trimOrNull(values.theme),
    dress_code: trimOrNull(values.dressCode),
    religion: trimOrNull(values.religion),
    language: trimOrNull(values.language),
    notes: trimOrNull(values.notes),
  };
}

function toUpdateRow(
  values: UpdateClientInput,
  before: Client,
): UpdateClientRow {
  return {
    name: values.name.trim(),
    email: values.email?.trim().toLowerCase() || null,
    phone: trimOrNull(values.phone),
    client_type: values.clientType ?? null,
    project_id:
      values.projectId !== undefined ? values.projectId : before.project_id,
    owner_id: values.ownerId !== undefined ? values.ownerId : before.owner_id,
    lead_owner_id:
      values.leadOwnerId !== undefined
        ? values.leadOwnerId
        : before.lead_owner_id,
    assigned_pic_id:
      values.assignedPicId !== undefined
        ? values.assignedPicId
        : before.assigned_pic_id,
    client_code:
      values.clientCode !== undefined
        ? trimOrNull(values.clientCode)
        : before.client_code,
    company_name:
      values.companyName !== undefined
        ? trimOrNull(values.companyName)
        : before.company_name,
    bride_name:
      values.brideName !== undefined
        ? trimOrNull(values.brideName)
        : before.bride_name,
    groom_name:
      values.groomName !== undefined
        ? trimOrNull(values.groomName)
        : before.groom_name,
    display_name: resolveDisplayName({
      displayName:
        values.displayName !== undefined
          ? values.displayName
          : before.display_name,
      brideName:
        values.brideName !== undefined ? values.brideName : before.bride_name,
      groomName:
        values.groomName !== undefined ? values.groomName : before.groom_name,
      name: values.name,
    }),
    contact_person:
      values.contactPerson !== undefined
        ? trimOrNull(values.contactPerson)
        : before.contact_person,
    whatsapp:
      values.whatsapp !== undefined
        ? trimOrNull(values.whatsapp)
        : before.whatsapp,
    instagram:
      values.instagram !== undefined
        ? trimOrNull(values.instagram)
        : before.instagram,
    facebook:
      values.facebook !== undefined
        ? trimOrNull(values.facebook)
        : before.facebook,
    home_address:
      values.homeAddress !== undefined
        ? trimOrNull(values.homeAddress)
        : before.home_address,
    city: values.city !== undefined ? trimOrNull(values.city) : before.city,
    state: values.state !== undefined ? trimOrNull(values.state) : before.state,
    country:
      values.country !== undefined ? trimOrNull(values.country) : before.country,
    birthday:
      values.birthday !== undefined ? values.birthday : before.birthday,
    anniversary:
      values.anniversary !== undefined
        ? values.anniversary
        : before.anniversary,
    status: values.status ?? before.status,
    is_active:
      values.isActive !== undefined ? values.isActive : before.is_active,
    source: values.source !== undefined ? values.source : before.source,
    follow_up_at:
      values.followUpAt !== undefined
        ? values.followUpAt
        : before.follow_up_at,
    wedding_date:
      values.weddingDate !== undefined
        ? values.weddingDate
        : before.wedding_date,
    wedding_type:
      values.weddingType !== undefined
        ? trimOrNull(values.weddingType)
        : before.wedding_type,
    session: values.session !== undefined ? values.session : before.session,
    include_rom:
      values.includeRom !== undefined
        ? values.includeRom
        : before.include_rom,
    include_lunch:
      values.includeLunch !== undefined
        ? values.includeLunch
        : before.include_lunch,
    include_dinner:
      values.includeDinner !== undefined
        ? values.includeDinner
        : before.include_dinner,
    venue: values.venue !== undefined ? trimOrNull(values.venue) : before.venue,
    ballroom:
      values.ballroom !== undefined
        ? trimOrNull(values.ballroom)
        : before.ballroom,
    expected_pax:
      values.expectedPax !== undefined
        ? values.expectedPax
        : before.expected_pax,
    theme: values.theme !== undefined ? trimOrNull(values.theme) : before.theme,
    dress_code:
      values.dressCode !== undefined
        ? trimOrNull(values.dressCode)
        : before.dress_code,
    religion:
      values.religion !== undefined
        ? trimOrNull(values.religion)
        : before.religion,
    language:
      values.language !== undefined
        ? trimOrNull(values.language)
        : before.language,
    notes:
      values.notes !== undefined ? trimOrNull(values.notes) : before.notes,
  };
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
    let client = await insertClient(toInsertRow(values, companyId));

    if (!client.client_code) {
      client = await updateClientById(client.id, {
        client_code: `CL-${client.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
      });
    }

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
    const client = await updateClientById(before.id, toUpdateRow(values, before));

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
    const client = await updateClientById(before.id, {
      status: "archived",
      is_active: false,
    });
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
    const client = await updateClientById(before.id, {
      status: "inquiry",
      is_active: true,
    });
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

export async function deleteClient(
  input: ClientIdInput,
  context?: ClientMutationContext,
): Promise<void> {
  const values = clientIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getClientById(
    values.clientId,
    values.workspaceId,
    companyId,
  );

  try {
    // Soft-delete via archive so history and project links remain recoverable.
    const archived = await updateClientById(before.id, {
      status: "archived",
      is_active: false,
    });
    if (context?.actorId) {
      recordClientAudit({
        action: "archive",
        actorId: context.actorId,
        before,
        after: archived,
        metadata: { reason: "delete" },
      });
    }
  } catch (error) {
    console.error("deleteClient failed", error);
    throw new CoreError("CLIENT_DELETE_FAILED", "Failed to delete client.");
  }
}

export async function setClientActive(
  input: ClientIdInput & { isActive: boolean },
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
      "Archived clients cannot change active state. Restore first.",
    );
  }

  try {
    const client = await updateClientById(before.id, {
      is_active: input.isActive,
    });
    if (context?.actorId) {
      recordClientAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: client,
        metadata: { reason: input.isActive ? "activate" : "deactivate" },
      });
    }
    return client;
  } catch (error) {
    console.error("setClientActive failed", error);
    throw new CoreError(
      "CLIENT_UPDATE_FAILED",
      "Failed to update client active state.",
    );
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
