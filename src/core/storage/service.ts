import { CoreError } from "@/core/errors";
import {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  STORAGE_ALLOWED_EXTENSIONS,
  STORAGE_ALLOWED_MIME_TYPES,
  STORAGE_BUCKETS,
  type StorageBucket,
} from "@/core/storage/constants";
import {
  buildStoragePath as buildPath,
  extractExtension,
  generateStorageKey as generateKey,
  normalizeStoragePath,
  resolveBucket as resolveBucketName,
  sanitizeFilename,
} from "@/core/storage/paths";
import {
  buildStoragePathInputSchema,
  createStorageObjectSchema,
  deleteStorageObjectSchema,
  listStorageObjectsQuerySchema,
  storageObjectIdSchema,
  validateUploadInputSchema,
  type BuildStoragePathInput,
  type CreateStorageObjectInput,
  type DeleteStorageObjectInput,
  type ListStorageObjectsQuery,
  type StorageObjectIdInput,
  type ValidateUploadInput,
} from "@/core/storage/schema";
import type { StorageObject, StoragePathParts } from "@/core/storage/types";

export type ValidatedUpload = {
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
};

/**
 * Storage domain service contract.
 * Project 045: path + validation helpers only — no upload implementation.
 */
export interface StorageService {
  findById(input: StorageObjectIdInput): Promise<StorageObject>;
  list(query: ListStorageObjectsQuery): Promise<StorageObject[]>;
  create(input: CreateStorageObjectInput): Promise<StorageObject>;
  delete(input: DeleteStorageObjectInput): Promise<void>;
  buildStoragePath(parts: StoragePathParts): string;
  resolveBucket(bucket: StorageBucket | string): StorageBucket;
  validateUpload(input: ValidateUploadInput): ValidatedUpload;
  generateStorageKey(parts: StoragePathParts, uniqueSuffix?: string): string;
}

/** Validate a display/original filename. */
export function validateFilename(filename: string): string {
  const trimmed = filename.trim();
  if (!trimmed) {
    throw new CoreError("STORAGE_FILENAME_REQUIRED", "Filename is required.");
  }
  if (trimmed.length > 500) {
    throw new CoreError(
      "STORAGE_FILENAME_TOO_LONG",
      "Filename must be 500 characters or fewer.",
    );
  }
  if (/[/\\]/.test(trimmed)) {
    throw new CoreError(
      "STORAGE_FILENAME_INVALID",
      "Filename must not include path separators.",
    );
  }
  return sanitizeFilename(trimmed);
}

/** Validate and normalize a file extension (without leading dot). */
export function validateExtension(extension: string): string {
  const normalized = extension.trim().replace(/^\./, "").toLowerCase();
  if (!normalized) {
    throw new CoreError(
      "STORAGE_EXTENSION_REQUIRED",
      "File extension is required.",
    );
  }
  if (
    !(STORAGE_ALLOWED_EXTENSIONS as readonly string[]).includes(normalized)
  ) {
    throw new CoreError(
      "STORAGE_EXTENSION_UNSUPPORTED",
      `File extension .${normalized} is not allowed.`,
    );
  }
  return normalized;
}

/** Validate a MIME type against the allowed catalog. */
export function validateMimeType(mimeType: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (!normalized) {
    throw new CoreError(
      "STORAGE_MIME_REQUIRED",
      "MIME type is required.",
    );
  }
  if (!(STORAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(normalized)) {
    throw new CoreError(
      "STORAGE_MIME_UNSUPPORTED",
      `MIME type ${normalized} is not allowed.`,
    );
  }
  return normalized;
}

/** Validate file size against an optional max (default platform limit). */
export function validateFileSize(
  size: number,
  maxSizeBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
): number {
  if (!Number.isFinite(size) || size < 0 || !Number.isInteger(size)) {
    throw new CoreError(
      "STORAGE_SIZE_INVALID",
      "File size must be a non-negative integer.",
    );
  }
  if (size > maxSizeBytes) {
    throw new CoreError(
      "STORAGE_SIZE_TOO_LARGE",
      `File exceeds the maximum size of ${maxSizeBytes} bytes.`,
    );
  }
  return size;
}

/** Validate upload metadata (no bytes transferred). */
export function validateUpload(input: unknown): ValidatedUpload {
  const values = validateUploadInputSchema.parse(input);
  const filename = validateFilename(values.filename);
  const extension = validateExtension(extractExtension(filename));
  const mimeType = validateMimeType(values.mimeType);
  const size = validateFileSize(values.size, values.maxSizeBytes);
  return { filename, extension, mimeType, size };
}

export function buildStoragePath(parts: StoragePathParts): string {
  const values = buildStoragePathInputSchema.parse(parts);
  validateFilename(values.filename);
  return buildPath({
    companyId: values.companyId,
    workspaceId: values.workspaceId,
    bucket: values.bucket,
    filename: values.filename,
    ownerId: values.ownerId,
  });
}

export function resolveBucket(bucket: StorageBucket | string): StorageBucket {
  if (!(STORAGE_BUCKETS as readonly string[]).includes(bucket)) {
    throw new CoreError(
      "STORAGE_BUCKET_INVALID",
      `Unknown storage bucket: ${bucket}`,
    );
  }
  return resolveBucketName(bucket as StorageBucket);
}

export function generateStorageKey(
  parts: StoragePathParts,
  uniqueSuffix?: string,
): string {
  const values = buildStoragePathInputSchema.parse(parts);
  validateFilename(values.filename);
  return generateKey(
    {
      companyId: values.companyId,
      workspaceId: values.workspaceId,
      bucket: values.bucket,
      filename: values.filename,
      ownerId: values.ownerId,
    },
    uniqueSuffix,
  );
}

export function validateCreateStorageObject(
  input: unknown,
): CreateStorageObjectInput {
  return createStorageObjectSchema.parse(input);
}

export function validateListStorageObjectsQuery(
  input: unknown,
): ListStorageObjectsQuery {
  return listStorageObjectsQuerySchema.parse(input);
}

export function validateStorageObjectId(
  input: unknown,
): StorageObjectIdInput {
  return storageObjectIdSchema.parse(input);
}

export function validateDeleteStorageObject(
  input: unknown,
): DeleteStorageObjectInput {
  return deleteStorageObjectSchema.parse(input);
}

export type { BuildStoragePathInput };
export { normalizeStoragePath };
