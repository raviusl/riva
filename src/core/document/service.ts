import {
  createDocumentSchema,
  deleteDocumentSchema,
  documentIdSchema,
  listDocumentsQuerySchema,
  updateDocumentSchema,
  type CreateDocumentInput,
  type DeleteDocumentInput,
  type DocumentIdInput,
  type ListDocumentsQuery,
  type UpdateDocumentInput,
} from "@/core/document/schema";
import type { Document } from "@/core/document/types";

/**
 * Document domain service contract.
 * Project 033: validation only — no persistence or storage calls.
 */
export interface DocumentService {
  getDocument(input: DocumentIdInput): Promise<Document>;
  listDocuments(query: ListDocumentsQuery): Promise<Document[]>;
  listDocumentsByWorkspace(
    companyId: string,
    workspaceKind: Document["workspaceKind"],
    workspaceId: string,
  ): Promise<Document[]>;
  createDocument(input: CreateDocumentInput): Promise<Document>;
  updateDocument(input: UpdateDocumentInput): Promise<Document>;
  deleteDocument(input: DeleteDocumentInput): Promise<void>;
}

/** Validate create input. Persistence deferred. */
export function validateCreateDocument(input: unknown): CreateDocumentInput {
  return createDocumentSchema.parse(input);
}

/** Validate update input. Persistence deferred. */
export function validateUpdateDocument(input: unknown): UpdateDocumentInput {
  return updateDocumentSchema.parse(input);
}

/** Validate list query. Persistence deferred. */
export function validateListDocumentsQuery(
  input: unknown,
): ListDocumentsQuery {
  return listDocumentsQuerySchema.parse(input);
}

/** Validate document id input. Persistence deferred. */
export function validateDocumentId(input: unknown): DocumentIdInput {
  return documentIdSchema.parse(input);
}

/** Validate delete input. Persistence deferred. */
export function validateDeleteDocument(input: unknown): DeleteDocumentInput {
  return deleteDocumentSchema.parse(input);
}
