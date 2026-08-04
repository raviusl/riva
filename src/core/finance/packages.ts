import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type FinancePackage = {
  id: string;
  workspaceId: string;
  companyId: string;
  name: string;
  description: string | null;
  category: string | null;
  currency: string;
  defaultTax: number;
  isActive: boolean;
};

export type FinancePackageItem = {
  id: string;
  packageId: string;
  position: number;
  description: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure: string | null;
};

export type FinancePackageWithItems = FinancePackage & {
  items: FinancePackageItem[];
};

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export async function listFinancePackages(input: {
  workspaceId: string;
  companyId: string;
  activeOnly?: boolean;
}): Promise<FinancePackageWithItems[]> {
  const admin = createAdminClient();
  let query = admin
    .from("finance_packages")
    .select("*")
    .eq("workspace_id", input.workspaceId)
    .eq("company_id", input.companyId)
    .order("name", { ascending: true });

  if (input.activeOnly !== false) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  const packages = data ?? [];
  if (packages.length === 0) return [];

  const ids = packages.map((row) => row.id as string);
  const { data: items, error: itemsError } = await admin
    .from("finance_package_items")
    .select("*")
    .in("package_id", ids)
    .order("position", { ascending: true });

  if (itemsError) throw itemsError;

  const byPackage = new Map<string, FinancePackageItem[]>();
  for (const row of items ?? []) {
    const packageId = row.package_id as string;
    const list = byPackage.get(packageId) ?? [];
    list.push({
      id: row.id as string,
      packageId,
      position: asNumber(row.position),
      description: row.description as string,
      quantity: asNumber(row.quantity),
      unitPrice: asNumber(row.unit_price),
      unitOfMeasure: (row.unit_of_measure as string | null) ?? null,
    });
    byPackage.set(packageId, list);
  }

  return packages.map((row) => ({
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    companyId: row.company_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    category: (row.category as string | null | undefined) ?? null,
    currency: row.currency as string,
    defaultTax: asNumber(row.default_tax ?? 0),
    isActive: Boolean(row.is_active),
    items: byPackage.get(row.id as string) ?? [],
  }));
}
