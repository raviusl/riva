import "server-only";

import type { Client, ClientStatus, ClientType } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export function mapClientRow(data: Record<string, unknown>): Client {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: (data.project_id as string | null | undefined) ?? null,
    owner_id: (data.owner_id as string | null | undefined) ?? null,
    name: data.name as string,
    email: (data.email as string | null | undefined) ?? null,
    phone: (data.phone as string | null | undefined) ?? null,
    client_type: (data.client_type as ClientType | null | undefined) ?? null,
    status: data.status as ClientStatus,
    follow_up_at: (data.follow_up_at as string | null | undefined) ?? null,
    notes: (data.notes as string | null | undefined) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertClientRow = {
  workspace_id: string;
  company_id: string;
  project_id?: string | null;
  owner_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  client_type?: ClientType | null;
  status: ClientStatus;
  follow_up_at?: string | null;
  notes?: string | null;
};

export type UpdateClientRow = {
  project_id?: string | null;
  owner_id?: string | null;
  name?: string;
  email?: string | null;
  phone?: string | null;
  client_type?: ClientType | null;
  status?: ClientStatus;
  follow_up_at?: string | null;
  notes?: string | null;
};

export async function insertClient(row: InsertClientRow): Promise<Client> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_clients")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertClient returned no row");
  }

  return mapClientRow(data as Record<string, unknown>);
}

export async function findClientById(
  clientId: string,
  workspaceId?: string,
): Promise<Client | null> {
  const admin = createAdminClient();
  let query = admin.from("crm_clients").select("*").eq("id", clientId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return mapClientRow(data as Record<string, unknown>);
}

export async function findClientsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Client[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_clients")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapClientRow(row as Record<string, unknown>),
  );
}

export async function findClientsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Client[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_clients")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapClientRow(row as Record<string, unknown>),
  );
}

export async function updateClientById(
  clientId: string,
  patch: UpdateClientRow,
): Promise<Client> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_clients")
    .update(patch)
    .eq("id", clientId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateClientById returned no row");
  }

  return mapClientRow(data as Record<string, unknown>);
}
