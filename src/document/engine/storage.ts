import "server-only";

import { CoreError } from "@/core/errors";
import { sanitizeFilename } from "@/core/storage/paths";
import { createAdminClient } from "@/lib/supabase/admin";

const FINANCE_BUCKET = "finance";
const SIGNED_URL_TTL_SECONDS = 60 * 30;
const FINANCE_BUCKET_FILE_SIZE_LIMIT = 52_428_800;

export function buildFinanceDocumentStoragePath(input: {
  companyId: string;
  workspaceId: string;
  financeId: string;
  kind: string;
  version: number;
  filename: string;
}): string {
  const safeName = sanitizeFilename(input.filename);
  return [
    input.companyId,
    input.workspaceId,
    "documents",
    input.kind,
    input.financeId,
    `v${input.version}`,
    safeName,
  ].join("/");
}

/**
 * Step 3 — ensure the private `finance` storage bucket exists.
 * Matches Project 093 migration `20260803140000_project093_document_engine.sql`.
 */
async function ensureFinanceBucket(
  admin: ReturnType<typeof createAdminClient>,
): Promise<void> {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error("document pipeline step 3 failed: list buckets", listError);
    throw new CoreError(
      "DOCUMENT_STORAGE_BUCKET_FAILED",
      "Failed to verify document storage bucket.",
      { cause: listError },
    );
  }

  const exists = (buckets ?? []).some(
    (bucket) => bucket.id === FINANCE_BUCKET || bucket.name === FINANCE_BUCKET,
  );
  if (exists) return;

  const { error: createError } = await admin.storage.createBucket(
    FINANCE_BUCKET,
    {
      public: false,
      fileSizeLimit: FINANCE_BUCKET_FILE_SIZE_LIMIT,
      allowedMimeTypes: ["application/pdf"],
    },
  );

  // Race: another request created it first.
  if (
    createError &&
    !/already exists|duplicate|resource already/i.test(createError.message)
  ) {
    console.error(
      "document pipeline step 3 failed: create bucket",
      createError,
    );
    throw new CoreError(
      "DOCUMENT_STORAGE_BUCKET_FAILED",
      "Failed to create document storage bucket.",
      { cause: createError },
    );
  }
}

export async function uploadFinanceDocumentPdf(input: {
  storagePath: string;
  bytes: Buffer;
  contentType?: string;
}): Promise<{ bucket: string; path: string; sizeBytes: number }> {
  const admin = createAdminClient();

  // Step 3
  await ensureFinanceBucket(admin);

  // Step 4 — upload PDF bytes (Uint8Array avoids Node Buffer edge cases)
  const body = Uint8Array.from(input.bytes);

  const { error } = await admin.storage
    .from(FINANCE_BUCKET)
    .upload(input.storagePath, body, {
      contentType: input.contentType ?? "application/pdf",
      upsert: true,
    });

  if (error) {
    console.error("document pipeline step 4 failed: upload", {
      bucket: FINANCE_BUCKET,
      path: input.storagePath,
      sizeBytes: input.bytes.byteLength,
      error,
    });
    throw new CoreError(
      "DOCUMENT_STORAGE_UPLOAD_FAILED",
      "Failed to upload generated document.",
      { cause: error },
    );
  }

  return {
    bucket: FINANCE_BUCKET,
    path: input.storagePath,
    sizeBytes: input.bytes.byteLength,
  };
}

export async function createFinanceDocumentSignedUrl(input: {
  storagePath: string;
  download?: boolean;
  filename?: string;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(FINANCE_BUCKET)
    .createSignedUrl(input.storagePath, SIGNED_URL_TTL_SECONDS, {
      download: input.download ? (input.filename ?? true) : undefined,
    });

  if (error || !data?.signedUrl) {
    console.error("document pipeline step 6 failed: signed URL", {
      path: input.storagePath,
      error,
    });
    throw new CoreError(
      "DOCUMENT_SIGNED_URL_FAILED",
      "Failed to create document download link.",
      { cause: error },
    );
  }

  return data.signedUrl;
}
