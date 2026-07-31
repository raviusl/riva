/**
 * Storage Foundation — contracts + path/validation helpers (Project 045).
 * See docs/technical-blueprint/06_STORAGE_ARCHITECTURE.md
 *
 * No uploads · No Supabase Storage · No UI · No persistence.
 */

export type {
  StorageAllowedExtension,
  StorageAllowedMimeType,
  StorageBucket,
  StorageObject,
  StorageObjectId,
  StorageObjectModel,
  StoragePathParts,
  StorageVisibility,
} from "@/core/storage/types";

export {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  STORAGE_ALLOWED_EXTENSIONS,
  STORAGE_ALLOWED_MIME_TYPES,
  STORAGE_BUCKETS,
  STORAGE_VISIBILITIES,
} from "@/core/storage/constants";

export type {
  BuildStoragePathInput,
  CreateStorageObjectInput,
  DeleteStorageObjectInput,
  ListStorageObjectsQuery,
  StorageObjectIdInput,
  ValidateUploadInput,
} from "@/core/storage/schema";

export {
  buildStoragePathInputSchema,
  createStorageObjectSchema,
  deleteStorageObjectSchema,
  listStorageObjectsQuerySchema,
  storageBucketSchema,
  storageExtensionSchema,
  storageMimeTypeSchema,
  storageObjectIdSchema,
  storageObjectSchema,
  storageVisibilitySchema,
  validateUploadInputSchema,
} from "@/core/storage/schema";

export type { StorageRepository } from "@/core/storage/repository";

export type {
  StorageService,
  ValidatedUpload,
} from "@/core/storage/service";
export {
  buildStoragePath,
  generateStorageKey,
  normalizeStoragePath,
  resolveBucket,
  validateCreateStorageObject,
  validateDeleteStorageObject,
  validateExtension,
  validateFileSize,
  validateFilename,
  validateListStorageObjectsQuery,
  validateMimeType,
  validateStorageObjectId,
  validateUpload,
} from "@/core/storage/service";

export {
  extractExtension,
  sanitizeFilename,
} from "@/core/storage/paths";
