import { z } from "zod";

import {
  DEFAULT_MAX_FILE_SIZE_BYTES,
  STORAGE_ALLOWED_EXTENSIONS,
  STORAGE_ALLOWED_MIME_TYPES,
  STORAGE_BUCKETS,
  STORAGE_VISIBILITIES,
} from "@/core/storage/constants";

export const storageBucketSchema = z.enum(STORAGE_BUCKETS);
export const storageVisibilitySchema = z.enum(STORAGE_VISIBILITIES);
export const storageExtensionSchema = z.enum(STORAGE_ALLOWED_EXTENSIONS);
export const storageMimeTypeSchema = z.enum(STORAGE_ALLOWED_MIME_TYPES);

export const storageObjectIdSchema = z.object({
  storageObjectId: z.string().uuid(),
});

export type StorageObjectIdInput = z.infer<typeof storageObjectIdSchema>;

export const createStorageObjectSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  ownerId: z.string().uuid(),
  bucket: storageBucketSchema,
  path: z.string().min(1).max(2000),
  filename: z.string().min(1).max(500),
  extension: z.string().min(1).max(32),
  mimeType: z.string().min(1).max(200),
  size: z.number().int().nonnegative().max(DEFAULT_MAX_FILE_SIZE_BYTES),
  visibility: storageVisibilitySchema.optional().default("private"),
});

export type CreateStorageObjectInput = z.infer<
  typeof createStorageObjectSchema
>;

export const listStorageObjectsQuerySchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  bucket: storageBucketSchema.optional(),
  visibility: storageVisibilitySchema.optional(),
});

export type ListStorageObjectsQuery = z.infer<
  typeof listStorageObjectsQuerySchema
>;

export const deleteStorageObjectSchema = z.object({
  storageObjectId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteStorageObjectInput = z.infer<
  typeof deleteStorageObjectSchema
>;

export const validateUploadInputSchema = z.object({
  filename: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(200),
  size: z.number().int().nonnegative(),
  maxSizeBytes: z
    .number()
    .int()
    .positive()
    .optional()
    .default(DEFAULT_MAX_FILE_SIZE_BYTES),
  bucket: storageBucketSchema.optional(),
});

export type ValidateUploadInput = z.infer<typeof validateUploadInputSchema>;

export const buildStoragePathInputSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  bucket: storageBucketSchema,
  filename: z.string().min(1).max(500),
  ownerId: z.string().uuid().optional().nullable(),
});

export type BuildStoragePathInput = z.infer<typeof buildStoragePathInputSchema>;

/** Full StorageObject shape validation (read model). */
export const storageObjectSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  ownerId: z.string().uuid(),
  bucket: storageBucketSchema,
  path: z.string().min(1).max(2000),
  filename: z.string().min(1).max(500),
  extension: z.string().min(1).max(32),
  mimeType: z.string().min(1).max(200),
  size: z.number().int().nonnegative(),
  visibility: storageVisibilitySchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
