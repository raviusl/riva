/**
 * RIVA Document Engine (Project 093).
 * Generic finance document generation — reusable across quotation/invoice/etc.
 */

export type {
  DocumentKind,
  DocumentStatus,
  FinanceDocumentPayload,
  FinanceDocumentRecord,
  GenerateDocumentInput,
  GeneratedDocumentResult,
} from "@/document/engine/types";

export { DOCUMENT_KINDS, DOCUMENT_STATUSES } from "@/document/engine/types";
