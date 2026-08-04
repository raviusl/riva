/**
 * Document Engine — shared types (Project 093).
 * Reusable for quotation, invoice, receipt, purchase order, contract.
 */

import type { QuotationDocumentContent } from "@/core/finance/document-content";

export const DOCUMENT_KINDS = [
  "quotation",
  "invoice",
  "receipt",
  "purchase_order",
  "contract",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_STATUSES = ["ready", "failed"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export type DocumentCompanyProfile = {
  id: string;
  name: string;
  logoUrl: string | null;
  registrationNo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  country: string | null;
  timezone: string | null;
  locale: string | null;
  currency: string;
  /** Structured bank fields for payment cards on PDF templates. */
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  swiftCode: string | null;
};

export type DocumentWorkspaceProfile = {
  id: string;
  name: string;
  logoUrl: string | null;
  timezone: string | null;
  locale: string | null;
  currency: string;
};

export type DocumentClientProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
} | null;

export type DocumentProjectProfile = {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  projectType: string | null;
} | null;

export type DocumentLineItem = {
  position: number;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  amount: number;
  itemKind: string;
  unitOfMeasure: string | null;
  notes: string | null;
};

export type DocumentMoney = {
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  deposit: number | null;
  balance: number | null;
};

export type DocumentQuotationInfo = {
  id: string;
  referenceNumber: string;
  status: string;
  issuedAt: string | null;
  dueAt: string | null;
  notes: string | null;
  yourReference: string | null;
  preparedBy: string | null;
  salesPerson: string | null;
  cc: string | null;
  attentionTo: string | null;
  contactPerson: string | null;
  paymentTerms: string;
  termsAndConditions: string | null;
  bankDetails: string | null;
  paymentReference: string | null;
  validityLabel: string | null;
  deliveryTerm: string | null;
  eventNotes: string | null;
};

/**
 * Normalized payload every template receives.
 * `content` carries structured commercial fields from the editor.
 */
export type FinanceDocumentPayload = {
  kind: DocumentKind;
  generatedAt: string;
  company: DocumentCompanyProfile;
  workspace: DocumentWorkspaceProfile;
  client: DocumentClientProfile;
  project: DocumentProjectProfile;
  lineItems: DocumentLineItem[];
  money: DocumentMoney;
  quotation: DocumentQuotationInfo;
  content: QuotationDocumentContent;
  remarks: string | null;
  footerNote: string;
};

export type FinanceDocumentRecord = {
  id: string;
  workspaceId: string;
  companyId: string;
  financeId: string;
  documentKind: DocumentKind;
  version: number;
  status: DocumentStatus;
  storageBucket: string;
  storagePath: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  generatedBy: string;
  generatedAt: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type GenerateDocumentInput = {
  financeId: string;
  workspaceId: string;
  companyId: string;
  kind: DocumentKind;
  actorId: string;
  force?: boolean;
};

export type GeneratedDocumentResult = {
  document: FinanceDocumentRecord;
  signedUrl: string;
};
