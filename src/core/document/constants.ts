/**
 * Document domain constants (workspace kinds, statuses).
 */

export const DOCUMENT_WORKSPACE_KINDS = [
  "project",
  "client",
  "vendor",
  "meeting",
  "task",
] as const;
export type DocumentWorkspaceKind = (typeof DOCUMENT_WORKSPACE_KINDS)[number];

export const DOCUMENT_STATUSES = ["draft", "ready", "archived"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
