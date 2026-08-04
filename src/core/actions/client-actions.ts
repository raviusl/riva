"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import {
  archiveClient,
  createClient,
  deleteClient,
  markClientFollowUp,
  restoreClient,
  updateClient,
} from "@/core/client/client";
import { toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import type {
  ClientIdInput,
  CreateClientInput,
  UpdateClientInput,
} from "@/core/schemas";

export type ClientActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateClientPaths(clientId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/crm");
  if (clientId) {
    revalidatePath(`/dashboard/clients/${clientId}`);
  }
}

async function requireClientWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "client.write",
  );
}

export async function createClientAction(
  input: CreateClientInput,
): Promise<ClientActionResult<{ clientId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireClientWrite(userId, input.workspaceId, input.companyId);
    const client = await createClient(input, { actorId: userId });
    revalidateClientPaths(client.id);
    return { ok: true, data: { clientId: client.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create client"),
    };
  }
}

export async function updateClientAction(
  input: UpdateClientInput,
): Promise<ClientActionResult<{ clientId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireClientWrite(userId, input.workspaceId, input.companyId);
    const client = await updateClient(input, { actorId: userId });
    revalidateClientPaths(client.id);
    return { ok: true, data: { clientId: client.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update client"),
    };
  }
}

export async function archiveClientAction(
  input: ClientIdInput,
): Promise<ClientActionResult<{ clientId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireClientWrite(userId, input.workspaceId, input.companyId);
    const client = await archiveClient(input, { actorId: userId });
    revalidateClientPaths(client.id);
    return { ok: true, data: { clientId: client.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive client"),
    };
  }
}

export async function deleteClientAction(
  input: ClientIdInput,
): Promise<ClientActionResult<{ clientId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireClientWrite(userId, input.workspaceId, input.companyId);
    await deleteClient(input, { actorId: userId });
    revalidateClientPaths(input.clientId);
    return { ok: true, data: { clientId: input.clientId } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to delete client"),
    };
  }
}

export async function restoreClientAction(
  input: ClientIdInput,
): Promise<ClientActionResult<{ clientId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireClientWrite(userId, input.workspaceId, input.companyId);
    const client = await restoreClient(input, { actorId: userId });
    revalidateClientPaths(client.id);
    return { ok: true, data: { clientId: client.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore client"),
    };
  }
}

export async function markClientFollowUpAction(
  input: ClientIdInput,
): Promise<ClientActionResult<{ clientId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireClientWrite(userId, input.workspaceId, input.companyId);
    const client = await markClientFollowUp(input, { actorId: userId });
    revalidateClientPaths(client.id);
    return { ok: true, data: { clientId: client.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to mark client for follow-up"),
    };
  }
}
