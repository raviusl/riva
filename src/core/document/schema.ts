import { z } from "zod";

import {
  DOCUMENT_STATUSES,
  DOCUMENT_WORKSPACE_KINDS,
} from "@/core/document/constants";

export const documentWorkspaceKindSchema = z.enum(DOCUMENT_WORKSPACE_KINDS);
export const documentStatusSchema = z.enum(DOCUMENT_STATUSES);

export const documentIdSchema = z.object({
  documentId: z.string().uuid(),
});

export type DocumentIdInput = z.infer<typeof documentIdSchema>;

export const createDocumentSchema = z.object({
  companyId: z.string().uuid(),
  workspaceKind: documentWorkspaceKindSchema,
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Document name is required").max(200),
  originalFilename: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(200),
  extension: z.string().min(1).max(32),
  size: z.number().int().nonnegative(),
  storageKey: z.string().min(1).max(1000),
  folder: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  version: z.number().int().positive().optional().default(1),
  status: documentStatusSchema.optional().default("draft"),
  createdBy: z.string().uuid(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

export const updateDocumentSchema = z.object({
  documentId: z.string().uuid(),
  name: z.string().min(1, "Document name is required").max(200).optional(),
  folder: z.string().max(500).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  version: z.number().int().positive().optional(),
  status: documentStatusSchema.optional(),
  updatedBy: z.string().uuid(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const listDocumentsQuerySchema = z.object({
  companyId: z.string().uuid(),
  workspaceKind: documentWorkspaceKindSchema.optional(),
  workspaceId: z.string().uuid().optional(),
  folder: z.string().max(500).optional(),
  status: documentStatusSchema.optional(),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;

export const deleteDocumentSchema = z.object({
  documentId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteDocumentInput = z.infer<typeof deleteDocumentSchema>;

/** Full Document shape validation (read model). */
export const documentSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceKind: documentWorkspaceKindSchema,
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(200),
  originalFilename: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(200),
  extension: z.string().min(1).max(32),
  size: z.number().int().nonnegative(),
  storageKey: z.string().min(1).max(1000),
  folder: z.string().max(500).nullable(),
  description: z.string().max(5000).nullable(),
  version: z.number().int().positive(),
  status: documentStatusSchema,
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
