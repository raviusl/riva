/**
 * Document permission keys (placeholder).
 * Enforcement is deferred until the permission engine wires domain modules.
 */

export const DOCUMENT_PERMISSIONS = [
  "document.read",
  "document.write",
  "document.delete",
] as const;

export type DocumentPermission = (typeof DOCUMENT_PERMISSIONS)[number];
