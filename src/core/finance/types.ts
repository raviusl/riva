import type {
  FinanceCategory,
  FinanceStatus,
  FinanceType,
} from "@/core/finance/constants";
import type {
  FinanceLineItemKind,
  QuotationDocumentContent,
} from "@/core/finance/document-content";

export type {
  FinanceCategory,
  FinanceStatus,
  FinanceType,
  QuotationStatus,
} from "@/core/finance/constants";

export type {
  FinanceLineItemKind,
  QuotationDocumentContent,
} from "@/core/finance/document-content";

export type FinanceId = string;

/**
 * Core Finance entity shared across Project, Client, Vendor, and company workspaces.
 */
export type Finance = {
  id: FinanceId;
  companyId: string;
  workspaceId: string;
  projectId: string | null;
  clientId: string | null;
  vendorId: string | null;
  type: FinanceType;
  category: FinanceCategory;
  currency: string;
  amount: number;
  tax: number;
  discount: number;
  status: FinanceStatus;
  referenceNumber: string | null;
  issuedAt: string | null;
  dueAt: string | null;
  paidAt: string | null;
  convertedInvoiceId: string | null;
  notes: string | null;
  internalNotes: string | null;
  documentContent: QuotationDocumentContent;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinanceModel = Finance;

export type Income = Finance & { type: "income" };
export type Expense = Finance & { type: "expense" };
export type Invoice = Finance & { type: "invoice" };
export type Quotation = Finance & { type: "quotation" };
export type Payment = Finance & { type: "payment" };
export type Refund = Finance & { type: "refund" };
export type Budget = Finance & { type: "budget" };
export type Transaction = Finance & { type: "transaction" };

export type FinanceLineItem = {
  id: string;
  financeId: string;
  workspaceId: string;
  companyId: string;
  position: number;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  amount: number;
  itemKind: FinanceLineItemKind;
  unitOfMeasure: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type QuotationWithLines = Quotation & {
  lineItems: FinanceLineItem[];
};
