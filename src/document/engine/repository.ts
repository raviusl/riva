import "server-only";

import { CoreError } from "@/core/errors";
import type {
  DocumentKind,
  DocumentStatus,
  FinanceDocumentRecord,
} from "@/document/engine/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

function isMissingSchemaError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  const message = (error as { message?: string } | null)?.message ?? "";
  return (
    code === "PGRST204" ||
    code === "PGRST205" ||
    code === "42703" ||
    code === "42P01" ||
    /could not find the (table|column)/i.test(message) ||
    /column .* does not exist/i.test(message)
  );
}

function documentStoreUnavailable(cause?: unknown): CoreError {
  return new CoreError(
    "DOCUMENT_STORE_UNAVAILABLE",
    "Document storage is not available yet.",
    cause !== undefined ? { cause } : undefined,
  );
}

function mapRow(data: Record<string, unknown>): FinanceDocumentRecord {
  return {
    id: data.id as string,
    workspaceId: data.workspace_id as string,
    companyId: data.company_id as string,
    financeId: data.finance_id as string,
    documentKind: data.document_kind as DocumentKind,
    version: Number(data.version ?? 1),
    status: data.status as DocumentStatus,
    storageBucket: data.storage_bucket as string,
    storagePath: data.storage_path as string,
    filename: data.filename as string,
    mimeType: data.mime_type as string,
    sizeBytes: Number(data.size_bytes ?? 0),
    generatedBy: data.generated_by as string,
    generatedAt: data.generated_at as string,
    metadata: (data.metadata as Record<string, unknown> | null) ?? {},
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function findLatestFinanceDocument(input: {
  financeId: string;
  companyId: string;
  workspaceId: string;
  kind: DocumentKind;
}): Promise<FinanceDocumentRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_documents")
    .select("*")
    .eq("finance_id", input.financeId)
    .eq("company_id", input.companyId)
    .eq("workspace_id", input.workspaceId)
    .eq("document_kind", input.kind)
    .eq("status", "ready")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      throw documentStoreUnavailable(error);
    }
    throw error;
  }
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function nextDocumentVersion(input: {
  financeId: string;
  kind: DocumentKind;
}): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_documents")
    .select("version")
    .eq("finance_id", input.financeId)
    .eq("document_kind", input.kind)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      throw documentStoreUnavailable(error);
    }
    throw error;
  }
  return data ? Number(data.version) + 1 : 1;
}

export async function insertFinanceDocument(input: {
  workspaceId: string;
  companyId: string;
  financeId: string;
  documentKind: DocumentKind;
  version: number;
  status: DocumentStatus;
  storageBucket: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  generatedBy: string;
  metadata?: Record<string, unknown>;
}): Promise<FinanceDocumentRecord> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_documents")
    .insert({
      workspace_id: input.workspaceId,
      company_id: input.companyId,
      finance_id: input.financeId,
      document_kind: input.documentKind,
      version: input.version,
      status: input.status,
      storage_bucket: input.storageBucket,
      storage_path: input.storagePath,
      filename: input.filename,
      mime_type: input.mimeType,
      size_bytes: input.sizeBytes,
      generated_by: input.generatedBy,
      metadata: (input.metadata ?? {}) as Json,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error && isMissingSchemaError(error)) {
      throw documentStoreUnavailable(error);
    }
    throw error ?? new Error("insertFinanceDocument returned no row");
  }
  return mapRow(data as Record<string, unknown>);
}
