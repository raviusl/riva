import "server-only";

import type { Vendor, VendorCategory, VendorStatus } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export function mapVendorRow(data: Record<string, unknown>): Vendor {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: (data.project_id as string | null | undefined) ?? null,
    owner_id: (data.owner_id as string | null | undefined) ?? null,
    name: data.name as string,
    company_name: (data.company_name as string | null | undefined) ?? null,
    contact_person: (data.contact_person as string | null | undefined) ?? null,
    email: (data.email as string | null | undefined) ?? null,
    phone: (data.phone as string | null | undefined) ?? null,
    website: (data.website as string | null | undefined) ?? null,
    address: (data.address as string | null | undefined) ?? null,
    category: (data.category as VendorCategory | null | undefined) ?? null,
    status: data.status as VendorStatus,
    notes: (data.notes as string | null | undefined) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertVendorRow = {
  workspace_id: string;
  company_id: string;
  project_id?: string | null;
  owner_id?: string | null;
  name: string;
  company_name?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  category?: VendorCategory | null;
  status: VendorStatus;
  notes?: string | null;
};

export type UpdateVendorRow = {
  project_id?: string | null;
  owner_id?: string | null;
  name?: string;
  company_name?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  category?: VendorCategory | null;
  status?: VendorStatus;
  notes?: string | null;
};

export async function insertVendor(row: InsertVendorRow): Promise<Vendor> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendors")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertVendor returned no row");
  }

  return mapVendorRow(data as Record<string, unknown>);
}

export async function findVendorById(
  vendorId: string,
  workspaceId?: string,
): Promise<Vendor | null> {
  const admin = createAdminClient();
  let query = admin.from("vendors").select("*").eq("id", vendorId);
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
  return mapVendorRow(data as Record<string, unknown>);
}

export async function findVendorsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Vendor[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapVendorRow(row as Record<string, unknown>),
  );
}

export async function findVendorsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Vendor[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapVendorRow(row as Record<string, unknown>),
  );
}

export async function updateVendorById(
  vendorId: string,
  patch: UpdateVendorRow,
): Promise<Vendor> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("vendors")
    .update(patch)
    .eq("id", vendorId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateVendorById returned no row");
  }

  return mapVendorRow(data as Record<string, unknown>);
}
