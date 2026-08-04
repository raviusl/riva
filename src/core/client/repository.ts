import "server-only";

import type {
  Client,
  ClientSource,
  ClientStatus,
  ClientType,
} from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeClientType(value: unknown): ClientType | null {
  if (value == null) return null;
  const raw = String(value);
  if (raw === "bride" || raw === "groom") return "wedding";
  if (raw === "individual") return "private";
  if (
    raw === "wedding" ||
    raw === "corporate" ||
    raw === "private" ||
    raw === "others"
  ) {
    return raw;
  }
  return null;
}

function normalizeClientStatus(value: unknown): ClientStatus {
  const raw = String(value ?? "inquiry");
  if (raw === "active") return "inquiry";
  if (
    raw === "inquiry" ||
    raw === "follow_up" ||
    raw === "confirmed" ||
    raw === "completed" ||
    raw === "cancelled" ||
    raw === "archived"
  ) {
    return raw;
  }
  return "inquiry";
}

export function mapClientRow(data: Record<string, unknown>): Client {
  const status = normalizeClientStatus(data.status);
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: (data.project_id as string | null | undefined) ?? null,
    owner_id: (data.owner_id as string | null | undefined) ?? null,
    lead_owner_id: (data.lead_owner_id as string | null | undefined) ?? null,
    assigned_pic_id:
      (data.assigned_pic_id as string | null | undefined) ?? null,
    client_code: (data.client_code as string | null | undefined) ?? null,
    name: data.name as string,
    company_name: (data.company_name as string | null | undefined) ?? null,
    bride_name: (data.bride_name as string | null | undefined) ?? null,
    groom_name: (data.groom_name as string | null | undefined) ?? null,
    display_name: (data.display_name as string | null | undefined) ?? null,
    contact_person: (data.contact_person as string | null | undefined) ?? null,
    email: (data.email as string | null | undefined) ?? null,
    phone: (data.phone as string | null | undefined) ?? null,
    whatsapp: (data.whatsapp as string | null | undefined) ?? null,
    instagram: (data.instagram as string | null | undefined) ?? null,
    facebook: (data.facebook as string | null | undefined) ?? null,
    home_address: (data.home_address as string | null | undefined) ?? null,
    city: (data.city as string | null | undefined) ?? null,
    state: (data.state as string | null | undefined) ?? null,
    country: (data.country as string | null | undefined) ?? null,
    birthday: (data.birthday as string | null | undefined) ?? null,
    anniversary: (data.anniversary as string | null | undefined) ?? null,
    client_type: normalizeClientType(data.client_type),
    status,
    is_active:
      status === "archived"
        ? false
        : data.is_active === false
          ? false
          : true,
    source: (data.source as ClientSource | null | undefined) ?? null,
    follow_up_at: (data.follow_up_at as string | null | undefined) ?? null,
    wedding_date: (data.wedding_date as string | null | undefined) ?? null,
    wedding_type: (data.wedding_type as string | null | undefined) ?? null,
    session: (data.session as string | null | undefined) ?? null,
    include_rom: Boolean(data.include_rom),
    include_lunch: Boolean(data.include_lunch),
    include_dinner: Boolean(data.include_dinner),
    venue: (data.venue as string | null | undefined) ?? null,
    ballroom: (data.ballroom as string | null | undefined) ?? null,
    expected_pax:
      typeof data.expected_pax === "number" ? data.expected_pax : null,
    theme: (data.theme as string | null | undefined) ?? null,
    dress_code: (data.dress_code as string | null | undefined) ?? null,
    religion: (data.religion as string | null | undefined) ?? null,
    language: (data.language as string | null | undefined) ?? null,
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
  lead_owner_id?: string | null;
  assigned_pic_id?: string | null;
  client_code?: string | null;
  name: string;
  company_name?: string | null;
  bride_name?: string | null;
  groom_name?: string | null;
  display_name?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  home_address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
  client_type?: ClientType | null;
  status: ClientStatus;
  is_active?: boolean;
  source?: ClientSource | null;
  follow_up_at?: string | null;
  wedding_date?: string | null;
  wedding_type?: string | null;
  session?: string | null;
  include_rom?: boolean;
  include_lunch?: boolean;
  include_dinner?: boolean;
  venue?: string | null;
  ballroom?: string | null;
  expected_pax?: number | null;
  theme?: string | null;
  dress_code?: string | null;
  religion?: string | null;
  language?: string | null;
  notes?: string | null;
};

export type UpdateClientRow = Partial<Omit<InsertClientRow, "workspace_id" | "company_id" | "name">> & {
  name?: string;
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
  // Prefer projects.client_id relationship; also include legacy crm_clients.project_id
  const [{ data: byLegacy, error: legacyError }, { data: projectRow }] =
    await Promise.all([
      admin
        .from("crm_clients")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("company_id", companyId)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      admin
        .from("projects")
        .select("client_id")
        .eq("id", projectId)
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
    ]);

  if (legacyError) {
    throw legacyError;
  }

  const rows = new Map<string, Client>();
  for (const row of byLegacy ?? []) {
    const client = mapClientRow(row as Record<string, unknown>);
    rows.set(client.id, client);
  }

  const linkedClientId =
    (projectRow as { client_id?: string | null } | null)?.client_id ?? null;
  if (linkedClientId && !rows.has(linkedClientId)) {
    const linked = await findClientById(linkedClientId, workspaceId);
    if (linked && linked.company_id === companyId) {
      rows.set(linked.id, linked);
    }
  }

  return Array.from(rows.values());
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

export async function deleteClientById(clientId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("crm_clients").delete().eq("id", clientId);
  if (error) {
    throw error;
  }
}
