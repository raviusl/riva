import "server-only";

import type { Company, CompanyStatus, CompanyType } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export function mapCompanyRow(data: Record<string, unknown>): Company {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    name: data.name as string,
    slug: data.slug as string,
    status: data.status as CompanyStatus,
    type: (data.type as CompanyType | null | undefined) ?? null,
    logo_url: (data.logo_url as string | null | undefined) ?? null,
    country: (data.country as string | null | undefined) ?? null,
    timezone: (data.timezone as string | null | undefined) ?? null,
    locale: (data.locale as string | null | undefined) ?? null,
    currency: (data.currency as string | null | undefined) ?? null,
    registration_no: (data.registration_no as string | null | undefined) ?? null,
    address: (data.address as string | null | undefined) ?? null,
    phone: (data.phone as string | null | undefined) ?? null,
    email: (data.email as string | null | undefined) ?? null,
    website: (data.website as string | null | undefined) ?? null,
    bank_name: (data.bank_name as string | null | undefined) ?? null,
    bank_account_name:
      (data.bank_account_name as string | null | undefined) ?? null,
    bank_account_number:
      (data.bank_account_number as string | null | undefined) ?? null,
    swift_code: (data.swift_code as string | null | undefined) ?? null,
    signature_url: (data.signature_url as string | null | undefined) ?? null,
    default_payment_terms:
      (data.default_payment_terms as string | null | undefined) ?? null,
    default_terms_and_conditions:
      (data.default_terms_and_conditions as string | null | undefined) ?? null,
    default_document_footer:
      (data.default_document_footer as string | null | undefined) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertCompanyRow = {
  workspace_id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  type?: CompanyType | null;
  logo_url?: string | null;
  country?: string | null;
  timezone?: string | null;
  locale?: string | null;
  currency?: string | null;
};

export type UpdateCompanyRow = {
  name?: string;
  type?: CompanyType | null;
  logo_url?: string | null;
  country?: string | null;
  timezone?: string | null;
  locale?: string | null;
  currency?: string | null;
  registration_no?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  swift_code?: string | null;
  signature_url?: string | null;
  default_payment_terms?: string | null;
  default_terms_and_conditions?: string | null;
  default_document_footer?: string | null;
  status?: CompanyStatus;
};

export async function insertCompany(row: InsertCompanyRow): Promise<Company> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertCompany returned no row");
  }

  return mapCompanyRow(data as Record<string, unknown>);
}

export async function findCompanyById(
  companyId: string,
  workspaceId?: string,
): Promise<Company | null> {
  const admin = createAdminClient();
  let query = admin.from("companies").select("*").eq("id", companyId);
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
  return mapCompanyRow(data as Record<string, unknown>);
}

export async function findCompanyBySlug(
  workspaceId: string,
  slug: string,
): Promise<Company | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return mapCompanyRow(data as Record<string, unknown>);
}

export async function findCompaniesByWorkspace(
  workspaceId: string,
): Promise<Company[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapCompanyRow(row as Record<string, unknown>),
  );
}

export async function updateCompanyById(
  companyId: string,
  patch: UpdateCompanyRow,
): Promise<Company> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .update(patch)
    .eq("id", companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateCompanyById returned no row");
  }

  return mapCompanyRow(data as Record<string, unknown>);
}
