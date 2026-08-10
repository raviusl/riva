import "server-only";

import {
  WEDDING_PACKAGE_STATUSES,
  type WeddingPackageStatus,
} from "@/core/wedding-package/constants";
import type {
  WeddingProjectPackage,
  WeddingProjectPackageItem,
  WeddingProjectPackageWithItems,
} from "@/core/wedding-package/types";
import { createAdminClient } from "@/lib/supabase/admin";

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function asStatus(value: unknown): WeddingPackageStatus {
  const raw = String(value ?? "draft");
  return (WEDDING_PACKAGE_STATUSES as readonly string[]).includes(raw)
    ? (raw as WeddingPackageStatus)
    : "draft";
}

export function mapWeddingPackageRow(
  data: Record<string, unknown>,
): WeddingProjectPackage {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    source_finance_package_id:
      (data.source_finance_package_id as string | null) ?? null,
    name: data.name as string,
    description: (data.description as string | null) ?? null,
    currency: (data.currency as string) || "MYR",
    status: asStatus(data.status),
    sequence: Number(data.sequence ?? 0),
    notes: (data.notes as string | null) ?? null,
    archived_at: (data.archived_at as string | null) ?? null,
    created_by: (data.created_by as string | null) ?? null,
    updated_by: (data.updated_by as string | null) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export function mapWeddingPackageItemRow(
  data: Record<string, unknown>,
): WeddingProjectPackageItem {
  return {
    id: data.id as string,
    package_id: data.package_id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    position: Number(data.position ?? 0),
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    quantity: asNumber(data.quantity),
    unit_price: asNumber(data.unit_price),
    unit_of_measure: (data.unit_of_measure as string | null) ?? null,
    category: (data.category as string | null) ?? null,
    vendor_id: (data.vendor_id as string | null) ?? null,
    is_included: Boolean(data.is_included ?? true),
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertWeddingPackageRow = {
  workspace_id: string;
  company_id: string;
  project_id: string;
  source_finance_package_id?: string | null;
  name: string;
  description?: string | null;
  currency: string;
  status: WeddingPackageStatus;
  sequence: number;
  notes?: string | null;
  created_by?: string | null;
};

export type InsertWeddingPackageItemRow = {
  package_id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  position: number;
  title: string;
  description?: string | null;
  quantity: number;
  unit_price: number;
  unit_of_measure?: string | null;
  category?: string | null;
  vendor_id?: string | null;
  is_included?: boolean;
};

export async function findWeddingPackagesByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
  options?: { includeArchived?: boolean },
): Promise<WeddingProjectPackageWithItems[]> {
  const admin = createAdminClient();
  let query = admin
    .from("wedding_project_packages")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("sequence", { ascending: true })
    .order("created_at", { ascending: true });

  if (!options?.includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  const packages = (data ?? []).map((row) =>
    mapWeddingPackageRow(row as Record<string, unknown>),
  );
  if (packages.length === 0) return [];

  const ids = packages.map((row) => row.id);
  const { data: itemRows, error: itemsError } = await admin
    .from("wedding_project_package_items")
    .select("*")
    .in("package_id", ids)
    .order("position", { ascending: true });
  if (itemsError) throw itemsError;

  const byPackage = new Map<string, WeddingProjectPackageItem[]>();
  for (const row of itemRows ?? []) {
    const item = mapWeddingPackageItemRow(row as Record<string, unknown>);
    const list = byPackage.get(item.package_id) ?? [];
    list.push(item);
    byPackage.set(item.package_id, list);
  }

  return packages.map((pkg) => ({
    ...pkg,
    items: byPackage.get(pkg.id) ?? [],
  }));
}

export async function findWeddingPackageById(
  packageId: string,
  workspaceId?: string,
): Promise<WeddingProjectPackageWithItems | null> {
  const admin = createAdminClient();
  let query = admin
    .from("wedding_project_packages")
    .select("*")
    .eq("id", packageId);
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const pkg = mapWeddingPackageRow(data as Record<string, unknown>);
  const { data: itemRows, error: itemsError } = await admin
    .from("wedding_project_package_items")
    .select("*")
    .eq("package_id", packageId)
    .order("position", { ascending: true });
  if (itemsError) throw itemsError;

  return {
    ...pkg,
    items: (itemRows ?? []).map((row) =>
      mapWeddingPackageItemRow(row as Record<string, unknown>),
    ),
  };
}

export async function insertWeddingPackage(
  row: InsertWeddingPackageRow,
): Promise<WeddingProjectPackage> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_project_packages")
    .insert(row as never)
    .select("*")
    .single();
  if (error || !data) {
    throw error ?? new Error("insertWeddingPackage returned no row");
  }
  return mapWeddingPackageRow(data as Record<string, unknown>);
}

export async function updateWeddingPackageById(
  packageId: string,
  patch: Partial<InsertWeddingPackageRow> & {
    archived_at?: string | null;
    updated_by?: string | null;
  },
): Promise<WeddingProjectPackage> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_project_packages")
    .update({ ...patch, updated_at: new Date().toISOString() } as never)
    .eq("id", packageId)
    .select("*")
    .single();
  if (error || !data) {
    throw error ?? new Error("updateWeddingPackageById returned no row");
  }
  return mapWeddingPackageRow(data as Record<string, unknown>);
}

export async function deleteWeddingPackageById(packageId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("wedding_project_packages")
    .delete()
    .eq("id", packageId);
  if (error) throw error;
}

export async function replaceWeddingPackageItems(
  packageId: string,
  rows: InsertWeddingPackageItemRow[],
): Promise<WeddingProjectPackageItem[]> {
  const admin = createAdminClient();
  const { error: deleteError } = await admin
    .from("wedding_project_package_items")
    .delete()
    .eq("package_id", packageId);
  if (deleteError) throw deleteError;

  if (rows.length === 0) return [];

  const { data, error } = await admin
    .from("wedding_project_package_items")
    .insert(rows as never)
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) =>
    mapWeddingPackageItemRow(row as Record<string, unknown>),
  );
}
