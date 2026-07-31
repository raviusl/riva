/**
 * Storage path helpers (Project 045).
 * Path construction only — no upload / provider calls.
 */

import type { StorageBucket } from "@/core/storage/constants";
import type { StoragePathParts } from "@/core/storage/types";

const UNSAFE_FILENAME_CHARS = /[^a-zA-Z0-9._-]+/g;
const MULTI_DOTS = /\.{2,}/g;
const MULTI_SLASHES = /\/{2,}/g;

/** Strip path separators and unsafe characters from a filename. */
export function sanitizeFilename(filename: string): string {
  const base = filename.trim().split(/[/\\]/).pop() ?? filename;
  return base
    .replace(UNSAFE_FILENAME_CHARS, "_")
    .replace(MULTI_DOTS, ".")
    .replace(/^\.+/, "")
    .slice(0, 500);
}

/** Normalize a storage path to a stable relative key (no leading slash). */
export function normalizeStoragePath(path: string): string {
  return path
    .trim()
    .replace(/\\/g, "/")
    .replace(MULTI_SLASHES, "/")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
}

/**
 * Build a company-scoped object path:
 * `{companyId}/{workspaceId}/{bucket}/{optionalOwnerId}/{filename}`
 */
export function buildStoragePath(parts: StoragePathParts): string {
  const filename = sanitizeFilename(parts.filename);
  const segments = [
    parts.companyId,
    parts.workspaceId,
    parts.bucket,
    parts.ownerId ? parts.ownerId : null,
    filename,
  ].filter((segment): segment is string => Boolean(segment));

  return normalizeStoragePath(segments.join("/"));
}

/** Resolve the canonical bucket name (identity for known buckets). */
export function resolveBucket(bucket: StorageBucket): StorageBucket {
  return bucket;
}

/**
 * Generate an opaque storage key (path + unique suffix).
 * No provider upload — key generation only.
 */
export function generateStorageKey(
  parts: StoragePathParts,
  uniqueSuffix: string = cryptoRandomSuffix(),
): string {
  const path = buildStoragePath(parts);
  const extension = extractExtension(parts.filename);
  const withoutExt = extension
    ? path.slice(0, -(extension.length + 1))
    : path;
  const key = extension
    ? `${withoutExt}-${uniqueSuffix}.${extension}`
    : `${path}-${uniqueSuffix}`;
  return normalizeStoragePath(key);
}

export function extractExtension(filename: string): string {
  const safe = sanitizeFilename(filename);
  const index = safe.lastIndexOf(".");
  if (index <= 0 || index === safe.length - 1) return "";
  return safe.slice(index + 1).toLowerCase();
}

function cryptoRandomSuffix(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
