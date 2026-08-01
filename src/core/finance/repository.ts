import "server-only";

import type {
  CreateFinanceInput,
  DeleteFinanceInput,
  ListFinanceQuery,
  ListQuotationsQuery,
  UpdateFinanceInput,
} from "@/core/finance/schema";
import type {
  Finance,
  FinanceId,
  FinanceLineItem,
  Quotation,
} from "@/core/finance/types";
import type { FinanceCategory, FinanceStatus, FinanceType } from "@/core/finance/constants";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Finance persistence contract — implemented for Project 089.
 */
export interface FinanceRepository {
  findById(financeId: FinanceId): Promise<Finance | null>;
  list(query: ListFinanceQuery): Promise<Finance[]>;
  listByWorkspace(
    companyId: string,
    workspaceId: string,
  ): Promise<Finance[]>;
  listByProject(
    companyId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<Finance[]>;
  create(input: CreateFinanceInput): Promise<Finance>;
  update(input: UpdateFinanceInput): Promise<Finance>;
  delete(input: DeleteFinanceInput): Promise<void>;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export function mapFinanceRow(data: Record<string, unknown>): Finance {
  return {
    id: data.id as string,
    companyId: data.company_id as string,
    workspaceId: data.workspace_id as string,
    projectId: (data.project_id as string | null | undefined) ?? null,
    clientId: (data.client_id as string | null | undefined) ?? null,
    vendorId: (data.vendor_id as string | null | undefined) ?? null,
    type: data.type as FinanceType,
    category: data.category as FinanceCategory,
    currency: data.currency as string,
    amount: asNumber(data.amount),
    tax: asNumber(data.tax),
    discount: asNumber(data.discount),
    status: data.status as FinanceStatus,
    referenceNumber:
      (data.reference_number as string | null | undefined) ?? null,
    issuedAt: (data.issued_at as string | null | undefined) ?? null,
    dueAt: (data.due_at as string | null | undefined) ?? null,
    paidAt: (data.paid_at as string | null | undefined) ?? null,
    convertedInvoiceId:
      (data.converted_invoice_id as string | null | undefined) ?? null,
    notes: (data.notes as string | null | undefined) ?? null,
    internalNotes: (data.internal_notes as string | null | undefined) ?? null,
    createdBy: data.created_by as string,
    updatedBy: (data.updated_by as string | null | undefined) ?? null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export function mapLineItemRow(data: Record<string, unknown>): FinanceLineItem {
  return {
    id: data.id as string,
    financeId: data.finance_id as string,
    workspaceId: data.workspace_id as string,
    companyId: data.company_id as string,
    position: asNumber(data.position),
    description: data.description as string,
    quantity: asNumber(data.quantity),
    unitPrice: asNumber(data.unit_price),
    tax: asNumber(data.tax),
    discount: asNumber(data.discount),
    amount: asNumber(data.amount),
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function findFinanceById(
  companyId: string,
  workspaceId: string,
  financeId: string,
): Promise<Finance | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_records")
    .select("*")
    .eq("id", financeId)
    .eq("company_id", companyId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapFinanceRow(data as Record<string, unknown>);
}

export async function listFinance(
  query: ListFinanceQuery,
): Promise<Finance[]> {
  const admin = createAdminClient();
  let builder = admin
    .from("finance_records")
    .select("*")
    .eq("company_id", query.companyId)
    .order("created_at", { ascending: false });

  if (query.workspaceId) {
    builder = builder.eq("workspace_id", query.workspaceId);
  }
  if (query.projectId) {
    builder = builder.eq("project_id", query.projectId);
  }
  if (query.clientId) {
    builder = builder.eq("client_id", query.clientId);
  }
  if (query.vendorId) {
    builder = builder.eq("vendor_id", query.vendorId);
  }
  if (query.type) {
    builder = builder.eq("type", query.type);
  }
  if (query.category) {
    builder = builder.eq("category", query.category);
  }
  if (query.status) {
    builder = builder.eq("status", query.status);
  }

  const { data, error } = await builder;
  if (error) throw error;
  return (data ?? []).map((row) =>
    mapFinanceRow(row as Record<string, unknown>),
  );
}

export async function listFinanceByWorkspace(
  companyId: string,
  workspaceId: string,
): Promise<Finance[]> {
  return listFinance({ companyId, workspaceId });
}

export async function listFinanceByProject(
  companyId: string,
  workspaceId: string,
  projectId: string,
): Promise<Finance[]> {
  return listFinance({ companyId, workspaceId, projectId });
}

export async function listQuotations(
  query: ListQuotationsQuery,
): Promise<Quotation[]> {
  const rows = await listFinance({
    companyId: query.companyId,
    workspaceId: query.workspaceId,
    projectId: query.projectId,
    clientId: query.clientId,
    type: "quotation",
    status: query.status,
  });
  return rows as Quotation[];
}

export async function insertFinance(input: {
  companyId: string;
  workspaceId: string;
  projectId?: string | null;
  clientId?: string | null;
  vendorId?: string | null;
  type: FinanceType;
  category?: FinanceCategory;
  currency?: string;
  amount: number;
  tax?: number;
  discount?: number;
  status?: FinanceStatus;
  referenceNumber?: string | null;
  issuedAt?: string | null;
  dueAt?: string | null;
  paidAt?: string | null;
  convertedInvoiceId?: string | null;
  notes?: string | null;
  internalNotes?: string | null;
  createdBy: string;
  updatedBy?: string | null;
}): Promise<Finance> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_records")
    .insert({
      company_id: input.companyId,
      workspace_id: input.workspaceId,
      project_id: input.projectId ?? null,
      client_id: input.clientId ?? null,
      vendor_id: input.vendorId ?? null,
      type: input.type,
      category: input.category ?? "general",
      currency: input.currency ?? "USD",
      amount: input.amount,
      tax: input.tax ?? 0,
      discount: input.discount ?? 0,
      status: input.status ?? "draft",
      reference_number: input.referenceNumber ?? null,
      issued_at: input.issuedAt ?? null,
      due_at: input.dueAt ?? null,
      paid_at: input.paidAt ?? null,
      converted_invoice_id: input.convertedInvoiceId ?? null,
      notes: input.notes ?? null,
      internal_notes: input.internalNotes ?? null,
      created_by: input.createdBy,
      updated_by: input.updatedBy ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertFinance returned no row");
  }
  return mapFinanceRow(data as Record<string, unknown>);
}

export async function updateFinanceById(
  companyId: string,
  workspaceId: string,
  financeId: string,
  patch: {
    projectId?: string | null;
    clientId?: string | null;
    vendorId?: string | null;
    type?: FinanceType;
    category?: FinanceCategory;
    currency?: string;
    amount?: number;
    tax?: number;
    discount?: number;
    status?: FinanceStatus;
    referenceNumber?: string | null;
    issuedAt?: string | null;
    dueAt?: string | null;
    paidAt?: string | null;
    convertedInvoiceId?: string | null;
    notes?: string | null;
    internalNotes?: string | null;
    updatedBy: string;
  },
): Promise<Finance> {
  const admin = createAdminClient();
  const updatePayload: {
    project_id?: string | null;
    client_id?: string | null;
    vendor_id?: string | null;
    type?: FinanceType;
    category?: FinanceCategory;
    currency?: string;
    amount?: number;
    tax?: number;
    discount?: number;
    status?: FinanceStatus;
    reference_number?: string | null;
    issued_at?: string | null;
    due_at?: string | null;
    paid_at?: string | null;
    converted_invoice_id?: string | null;
    notes?: string | null;
    internal_notes?: string | null;
    updated_by: string;
  } = {
    updated_by: patch.updatedBy,
  };

  if (patch.projectId !== undefined) updatePayload.project_id = patch.projectId;
  if (patch.clientId !== undefined) updatePayload.client_id = patch.clientId;
  if (patch.vendorId !== undefined) updatePayload.vendor_id = patch.vendorId;
  if (patch.type !== undefined) updatePayload.type = patch.type;
  if (patch.category !== undefined) updatePayload.category = patch.category;
  if (patch.currency !== undefined) updatePayload.currency = patch.currency;
  if (patch.amount !== undefined) updatePayload.amount = patch.amount;
  if (patch.tax !== undefined) updatePayload.tax = patch.tax;
  if (patch.discount !== undefined) updatePayload.discount = patch.discount;
  if (patch.status !== undefined) updatePayload.status = patch.status;
  if (patch.referenceNumber !== undefined) {
    updatePayload.reference_number = patch.referenceNumber;
  }
  if (patch.issuedAt !== undefined) updatePayload.issued_at = patch.issuedAt;
  if (patch.dueAt !== undefined) updatePayload.due_at = patch.dueAt;
  if (patch.paidAt !== undefined) updatePayload.paid_at = patch.paidAt;
  if (patch.convertedInvoiceId !== undefined) {
    updatePayload.converted_invoice_id = patch.convertedInvoiceId;
  }
  if (patch.notes !== undefined) updatePayload.notes = patch.notes;
  if (patch.internalNotes !== undefined) {
    updatePayload.internal_notes = patch.internalNotes;
  }

  const { data, error } = await admin
    .from("finance_records")
    .update(updatePayload)
    .eq("id", financeId)
    .eq("company_id", companyId)
    .eq("workspace_id", workspaceId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateFinanceById returned no row");
  }
  return mapFinanceRow(data as Record<string, unknown>);
}

export async function listLineItems(
  financeId: string,
): Promise<FinanceLineItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_line_items")
    .select("*")
    .eq("finance_id", financeId)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) =>
    mapLineItemRow(row as Record<string, unknown>),
  );
}

export async function replaceLineItems(
  financeId: string,
  companyId: string,
  workspaceId: string,
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    discount: number;
    amount: number;
  }>,
): Promise<FinanceLineItem[]> {
  const admin = createAdminClient();

  const { error: deleteError } = await admin
    .from("finance_line_items")
    .delete()
    .eq("finance_id", financeId)
    .eq("company_id", companyId)
    .eq("workspace_id", workspaceId);

  if (deleteError) throw deleteError;

  if (items.length === 0) return [];

  const { data, error } = await admin
    .from("finance_line_items")
    .insert(
      items.map((item, index) => ({
        finance_id: financeId,
        company_id: companyId,
        workspace_id: workspaceId,
        position: index,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax: item.tax,
        discount: item.discount,
        amount: item.amount,
      })),
    )
    .select("*")
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) =>
    mapLineItemRow(row as Record<string, unknown>),
  );
}
