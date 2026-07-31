/**
 * Storage Foundation constants (Project 045).
 */

export const STORAGE_BUCKETS = [
  "avatars",
  "documents",
  "projects",
  "meetings",
  "clients",
  "vendors",
  "finance",
  "timeline",
  "temp",
] as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export const STORAGE_VISIBILITIES = [
  "private",
  "internal",
  "workspace",
  "company",
  "public",
] as const;

export type StorageVisibility = (typeof STORAGE_VISIBILITIES)[number];

/** Default max upload size (bytes) — validation only; no upload yet. */
export const DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const STORAGE_ALLOWED_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "ppt",
  "pptx",
  "txt",
  "md",
  "zip",
  "mp3",
  "mp4",
  "mov",
] as const;

export type StorageAllowedExtension =
  (typeof STORAGE_ALLOWED_EXTENSIONS)[number];

export const STORAGE_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "application/zip",
  "audio/mpeg",
  "video/mp4",
  "video/quicktime",
] as const;

export type StorageAllowedMimeType =
  (typeof STORAGE_ALLOWED_MIME_TYPES)[number];
