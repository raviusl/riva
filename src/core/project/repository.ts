import "server-only";

import type { Project, ProjectStatus, ProjectType } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeProjectStatus(value: unknown): ProjectStatus {
  const raw = String(value ?? "inquiry");
  if (raw === "draft") return "inquiry";
  if (raw === "active") return "execution";
  if (
    raw === "inquiry" ||
    raw === "proposal" ||
    raw === "confirmed" ||
    raw === "planning" ||
    raw === "execution" ||
    raw === "completed" ||
    raw === "cancelled" ||
    raw === "archived"
  ) {
    return raw;
  }
  return "inquiry";
}

export function mapProjectRow(data: Record<string, unknown>): Project {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    client_id: (data.client_id as string | null | undefined) ?? null,
    name: data.name as string,
    project_code: (data.project_code as string | null | undefined) ?? null,
    description: (data.description as string | null | undefined) ?? null,
    project_type: (data.project_type as ProjectType | null | undefined) ?? null,
    status: normalizeProjectStatus(data.status),
    owner_id: (data.owner_id as string | null | undefined) ?? null,
    coordinator_id:
      (data.coordinator_id as string | null | undefined) ?? null,
    sales_id: (data.sales_id as string | null | undefined) ?? null,
    planner_id: (data.planner_id as string | null | undefined) ?? null,
    start_date: (data.start_date as string | null | undefined) ?? null,
    end_date: (data.end_date as string | null | undefined) ?? null,
    wedding_date: (data.wedding_date as string | null | undefined) ?? null,
    event_date: (data.event_date as string | null | undefined) ?? null,
    venue: (data.venue as string | null | undefined) ?? null,
    ballroom: (data.ballroom as string | null | undefined) ?? null,
    session: (data.session as string | null | undefined) ?? null,
    package_name: (data.package_name as string | null | undefined) ?? null,
    expected_pax: (() => {
      if (typeof data.expected_pax === "number") return data.expected_pax;
      if (data.expected_pax == null || data.expected_pax === "") return null;
      const parsed = Number(data.expected_pax);
      return Number.isFinite(parsed) ? parsed : null;
    })(),
    client_budget: (() => {
      if (typeof data.client_budget === "number") return data.client_budget;
      if (data.client_budget == null || data.client_budget === "") return null;
      const parsed = Number(data.client_budget);
      return Number.isFinite(parsed) ? parsed : null;
    })(),
    theme: (data.theme as string | null | undefined) ?? null,
    dress_code: (data.dress_code as string | null | undefined) ?? null,
    notes: (data.notes as string | null | undefined) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertProjectRow = {
  workspace_id: string;
  company_id: string;
  client_id?: string | null;
  name: string;
  project_code?: string | null;
  description?: string | null;
  project_type?: ProjectType | null;
  status: ProjectStatus;
  owner_id?: string | null;
  coordinator_id?: string | null;
  sales_id?: string | null;
  planner_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  wedding_date?: string | null;
  event_date?: string | null;
  venue?: string | null;
  ballroom?: string | null;
  session?: string | null;
  package_name?: string | null;
  expected_pax?: number | null;
  client_budget?: number | null;
  theme?: string | null;
  dress_code?: string | null;
  notes?: string | null;
};

export type UpdateProjectRow = Partial<
  Omit<InsertProjectRow, "workspace_id" | "company_id" | "name">
> & {
  name?: string;
};

export async function insertProject(row: InsertProjectRow): Promise<Project> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertProject returned no row");
  }

  return mapProjectRow(data as Record<string, unknown>);
}

export async function findProjectById(
  projectId: string,
  workspaceId?: string,
): Promise<Project | null> {
  const admin = createAdminClient();
  let query = admin.from("projects").select("*").eq("id", projectId);
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
  return mapProjectRow(data as Record<string, unknown>);
}

export async function findProjectsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Project[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapProjectRow(row as Record<string, unknown>),
  );
}

export async function findProjectsByWorkspace(
  workspaceId: string,
): Promise<Project[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapProjectRow(row as Record<string, unknown>),
  );
}

export async function findProjectsByClient(
  workspaceId: string,
  companyId: string,
  clientId: string,
): Promise<Project[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapProjectRow(row as Record<string, unknown>),
  );
}

export async function updateProjectById(
  projectId: string,
  patch: UpdateProjectRow,
): Promise<Project> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateProjectById returned no row");
  }

  return mapProjectRow(data as Record<string, unknown>);
}
