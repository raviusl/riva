import type {
  CreateDocumentInput,
  DeleteDocumentInput,
  ListDocumentsQuery,
  UpdateDocumentInput,
} from "@/core/document/schema";
import type { Document, DocumentId } from "@/core/document/types";

/**
 * Document persistence contract — implementation deferred.
 * No storage engine or repository implementation in Project 033.
 */
export interface DocumentRepository {
  findById(documentId: DocumentId): Promise<Document | null>;
  list(query: ListDocumentsQuery): Promise<Document[]>;
  listByWorkspace(
    companyId: string,
    workspaceKind: Document["workspaceKind"],
    workspaceId: string,
  ): Promise<Document[]>;
  insert(input: CreateDocumentInput): Promise<Document>;
  update(input: UpdateDocumentInput): Promise<Document>;
  delete(input: DeleteDocumentInput): Promise<void>;
}
