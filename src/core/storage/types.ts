/**
 * Shared Storage Foundation types — platform foundation (Project 045).
 * Upload providers and Supabase Storage integration are deferred.
 */

import type {
  StorageBucket,
  StorageVisibility,
} from "@/core/storage/constants";

export type {
  StorageAllowedExtension,
  StorageAllowedMimeType,
  StorageBucket,
  StorageVisibility,
} from "@/core/storage/constants";

export type StorageObjectId = string;

/**
 * Storage Object metadata.
 * Bytes live in object storage later; this record is the platform contract.
 */
export type StorageObject = {
  id: StorageObjectId;
  companyId: string;
  workspaceId: string;
  ownerId: string;
  bucket: StorageBucket;
  path: string;
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  visibility: StorageVisibility;
  createdAt: string;
  updatedAt: string;
};

export type StorageObjectModel = StorageObject;

/** Inputs used to build a normalized storage path / key. */
export type StoragePathParts = {
  companyId: string;
  workspaceId: string;
  bucket: StorageBucket;
  filename: string;
  ownerId?: string | null;
};
