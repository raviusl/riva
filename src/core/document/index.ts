/**
 * Document domain foundation — contracts + validation (Project 033).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 *
 * No UI · No Workspace · No storage · No server actions.
 */

export type {
  Document,
  DocumentId,
  DocumentModel,
  DocumentStatus,
  DocumentWorkspaceKind,
} from "@/core/document/types";

export {
  DOCUMENT_STATUSES,
  DOCUMENT_WORKSPACE_KINDS,
} from "@/core/document/constants";

export type {
  CreateDocumentInput,
  DeleteDocumentInput,
  DocumentIdInput,
  ListDocumentsQuery,
  UpdateDocumentInput,
} from "@/core/document/schema";

export {
  createDocumentSchema,
  deleteDocumentSchema,
  documentIdSchema,
  documentSchema,
  documentStatusSchema,
  documentWorkspaceKindSchema,
  listDocumentsQuerySchema,
  updateDocumentSchema,
} from "@/core/document/schema";

export type { DocumentRepository } from "@/core/document/repository";

export type { DocumentService } from "@/core/document/service";
export {
  validateCreateDocument,
  validateDeleteDocument,
  validateDocumentId,
  validateListDocumentsQuery,
  validateUpdateDocument,
} from "@/core/document/service";

export type { DocumentPermission } from "@/core/document/permissions";
export { DOCUMENT_PERMISSIONS } from "@/core/document/permissions";

export type {
  DocumentDomainEvent,
  DocumentEventName,
} from "@/core/document/events";
export { DOCUMENT_EVENTS } from "@/core/document/events";
