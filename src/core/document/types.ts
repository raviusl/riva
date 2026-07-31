/**
 * Shared Document domain types — platform foundation (Project 033).
 */

import type {
  DocumentStatus,
  DocumentWorkspaceKind,
} from "@/core/document/constants";

export type {
  DocumentStatus,
  DocumentWorkspaceKind,
} from "@/core/document/constants";

export type DocumentId = string;

/**
 * Core Document entity.
 * Belongs to exactly one entity Workspace (project | client | vendor | meeting | task).
 * Storage engine and persistence are deferred.
 */
export type Document = {
  id: DocumentId;
  companyId: string;
  workspaceKind: DocumentWorkspaceKind;
  workspaceId: string;
  name: string;
  originalFilename: string;
  mimeType: string;
  extension: string;
  size: number;
  storageKey: string;
  folder: string | null;
  description: string | null;
  version: number;
  status: DocumentStatus;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentModel = Document;
