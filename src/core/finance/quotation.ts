import "server-only";

import { getClientById } from "@/core/client/client";
import { getCompanyById } from "@/core/company/company";
import { requireCompany } from "@/core/company-isolation";
import { CoreError } from "@/core/errors";
import {
  recordQuotationAcceptedActivity,
  recordQuotationConvertedActivity,
  recordQuotationCreatedActivity,
  recordQuotationExpiredActivity,
  recordQuotationLineItemsReplacedActivity,
  recordQuotationRejectedActivity,
  recordQuotationSentActivity,
  recordQuotationUpdatedActivity,
  recordQuotationVoidedActivity,
  listQuotationActivities,
} from "@/core/finance/activity";
import { recordFinanceAudit } from "@/core/finance/audit";
import {
  EDITABLE_QUOTATION_STATUSES,
  type FinanceStatus,
  type QuotationStatus,
} from "@/core/finance/constants";
import { buildFinanceEvent } from "@/core/finance/events";
import { parseQuotationDocumentContent } from "@/core/finance/document-content";
import {
  createFinanceWithLineItems,
  findFinanceById,
  insertFinance,
  listLineItems,
  listQuotations as listQuotationsRows,
  replaceLineItems,
  updateFinanceById,
} from "@/core/finance/repository";
import {
  createQuotationSchema,
  listQuotationsQuerySchema,
  quotationIdSchema,
  transitionQuotationSchema,
  updateQuotationSchema,
  type CreateQuotationInput,
  type FinanceLineItemInput,
  type ListQuotationsQuery,
  type QuotationIdInput,
  type TransitionQuotationInput,
  type UpdateQuotationInput,
} from "@/core/finance/schema";
import { calculateTotal } from "@/core/finance/service";
import type {
  Finance,
  FinanceLineItem,
  Quotation,
  QuotationWithLines,
} from "@/core/finance/types";
import type { FinanceActivity } from "@/core/finance/activity-types";
import { getProjectById } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import { getWorkspaceById } from "@/core/workspace/workspace";

export type { CreateQuotationInput, UpdateQuotationInput, QuotationIdInput };

export type QuotationActorOptions = {
  actorId: string;
};

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Auto quotation number: QT-YYYYMMDD-XXXXXX */
export function generateQuotationNumber(now: Date = new Date()): string {
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
  ].join("");
  const suffix = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();
  return `QT-${stamp}-${suffix}`;
}

function rollupFromLines(items: FinanceLineItemInput[]): {
  amount: number;
  tax: number;
  discount: number;
  prepared: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    discount: number;
    amount: number;
    itemKind: NonNullable<FinanceLineItemInput["itemKind"]>;
    unitOfMeasure: string | null;
    notes: string | null;
  }>;
} {
  const prepared = items.map((item) => {
    const tax = item.tax ?? 0;
    const discount = item.discount ?? 0;
    const base = roundMoney(item.quantity * item.unitPrice);
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax,
      discount,
      amount: calculateTotal({ amount: base, tax, discount }),
      itemKind: item.itemKind ?? "line",
      unitOfMeasure: item.unitOfMeasure?.trim() || null,
      notes: item.notes?.trim() || null,
    };
  });

  const amount = roundMoney(prepared.reduce((sum, row) => sum + row.amount, 0));
  const tax = roundMoney(prepared.reduce((sum, row) => sum + row.tax, 0));
  const discount = roundMoney(
    prepared.reduce((sum, row) => sum + row.discount, 0),
  );

  return { amount, tax, discount, prepared };
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<string> {
  const scopedCompanyId = requireCompany(companyId);
  await getWorkspaceById(workspaceId);
  const company = await getCompanyById(scopedCompanyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  return scopedCompanyId;
}

async function assertProjectInCompany(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId || project.workspace_id !== workspaceId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
}

async function assertClientInCompany(
  workspaceId: string,
  companyId: string,
  clientId: string,
): Promise<void> {
  await getClientById(clientId, workspaceId, companyId);
}

async function assertVendorInCompany(
  workspaceId: string,
  companyId: string,
  vendorId: string,
): Promise<void> {
  await getVendorById(vendorId, workspaceId, companyId);
}

async function assertRelatedEntities(input: {
  workspaceId: string;
  companyId: string;
  projectId?: string | null;
  clientId?: string | null;
  vendorId?: string | null;
}): Promise<void> {
  if (input.projectId) {
    await assertProjectInCompany(
      input.workspaceId,
      input.companyId,
      input.projectId,
    );
  }
  if (input.clientId) {
    await assertClientInCompany(
      input.workspaceId,
      input.companyId,
      input.clientId,
    );
  }
  if (input.vendorId) {
    await assertVendorInCompany(
      input.workspaceId,
      input.companyId,
      input.vendorId,
    );
  }
}

function assertIsQuotation(finance: Finance): asserts finance is Quotation {
  if (finance.type !== "quotation") {
    throw new CoreError(
      "FINANCE_NOT_QUOTATION",
      "Finance record is not a quotation.",
    );
  }
}

function assertTransition(
  from: QuotationStatus,
  to: QuotationStatus,
): void {
  const allowed: Record<QuotationStatus, QuotationStatus[]> = {
    draft: ["sent", "void", "cancelled"],
    sent: ["accepted", "rejected", "expired", "void", "cancelled"],
    accepted: ["void"],
    rejected: [],
    expired: [],
    void: [],
    cancelled: [],
  };

  if (!allowed[from].includes(to)) {
    throw new CoreError(
      "QUOTATION_INVALID_TRANSITION",
      `Cannot transition quotation from ${from} to ${to}.`,
    );
  }
}

async function loadQuotation(
  input: QuotationIdInput,
): Promise<Quotation> {
  const parsed = quotationIdSchema.parse(input);
  const finance = await findFinanceById(
    parsed.companyId,
    parsed.workspaceId,
    parsed.quotationId,
  );
  if (!finance) {
    throw new CoreError("QUOTATION_NOT_FOUND", "Quotation not found.");
  }
  assertIsQuotation(finance);
  return finance;
}

export async function getQuotation(
  input: QuotationIdInput,
): Promise<QuotationWithLines> {
  const quotation = await loadQuotation(input);
  const lineItems = await listLineItems(quotation.id);
  return { ...quotation, lineItems };
}

export async function listQuotations(
  query: ListQuotationsQuery,
): Promise<Quotation[]> {
  const parsed = listQuotationsQuerySchema.parse(query);
  await assertCompanyInWorkspace(parsed.workspaceId, parsed.companyId);
  return listQuotationsRows(parsed);
}

export async function listQuotationActivityFeed(
  input: QuotationIdInput & { limit?: number },
): Promise<FinanceActivity[]> {
  const quotation = await loadQuotation(input);
  return listQuotationActivities({
    financeId: quotation.id,
    workspaceId: quotation.workspaceId,
    companyId: quotation.companyId,
    limit: input.limit,
  });
}

export async function createQuotation(
  input: CreateQuotationInput,
  options: QuotationActorOptions,
): Promise<QuotationWithLines> {
  const parsed = createQuotationSchema.parse(input);
  const companyId = await assertCompanyInWorkspace(
    parsed.workspaceId,
    parsed.companyId,
  );
  await assertRelatedEntities({
    workspaceId: parsed.workspaceId,
    companyId,
    projectId: parsed.projectId,
    clientId: parsed.clientId,
    vendorId: parsed.vendorId,
  });

  const { amount, tax, discount, prepared } = rollupFromLines(parsed.lineItems);
  const referenceNumber =
    parsed.referenceNumber?.trim() || generateQuotationNumber();

  let created: Finance;
  let lineItems: FinanceLineItem[];
  try {
    const persisted = await createFinanceWithLineItems(
      {
        companyId,
        workspaceId: parsed.workspaceId,
        projectId: parsed.projectId ?? null,
        clientId: parsed.clientId ?? null,
        vendorId: parsed.vendorId ?? null,
        type: "quotation",
        category: parsed.category,
        currency: parsed.currency,
        amount,
        tax,
        discount,
        status: "draft",
        referenceNumber,
        issuedAt: parsed.issuedAt ?? null,
        dueAt: parsed.dueAt ?? null,
        notes: parsed.notes ?? null,
        internalNotes: parsed.internalNotes ?? null,
        documentContent: parsed.documentContent
          ? parseQuotationDocumentContent(parsed.documentContent)
          : undefined,
        createdBy: parsed.createdBy,
      },
      prepared,
    );
    created = persisted.finance;
    lineItems = persisted.lineItems;
  } catch (error) {
    throw new CoreError(
      "QUOTATION_CREATE_FAILED",
      "Failed to save quotation. Changes were rolled back.",
      { cause: error },
    );
  }

  recordFinanceAudit({
    action: "create",
    actorId: options.actorId,
    before: null,
    after: created,
    metadata: { event: buildFinanceEvent({
      name: "quotation_created",
      financeId: created.id,
      actorId: options.actorId,
    }) },
  });
  await recordQuotationCreatedActivity(created, options.actorId);

  return { ...(created as Quotation), lineItems };
}

export async function updateQuotation(
  input: UpdateQuotationInput,
  options: QuotationActorOptions,
): Promise<QuotationWithLines> {
  const parsed = updateQuotationSchema.parse(input);
  const before = await loadQuotation({
    quotationId: parsed.quotationId,
    workspaceId: parsed.workspaceId,
    companyId: parsed.companyId,
  });

  if (!EDITABLE_QUOTATION_STATUSES.includes(before.status as QuotationStatus)) {
    throw new CoreError(
      "QUOTATION_NOT_EDITABLE",
      "Only draft quotations can be edited.",
    );
  }

  await assertRelatedEntities({
    workspaceId: parsed.workspaceId,
    companyId: parsed.companyId,
    projectId: parsed.projectId,
    clientId: parsed.clientId,
    vendorId: parsed.vendorId,
  });

  let amount = before.amount;
  let tax = before.tax;
  let discount = before.discount;
  let lineItems: FinanceLineItem[] = await listLineItems(before.id);
  let linesReplaced = false;

  if (parsed.lineItems) {
    const rolled = rollupFromLines(parsed.lineItems);
    amount = rolled.amount;
    tax = rolled.tax;
    discount = rolled.discount;
    lineItems = await replaceLineItems(
      before.id,
      parsed.companyId,
      parsed.workspaceId,
      rolled.prepared,
    );
    linesReplaced = true;
  }

  const after = await updateFinanceById(
    parsed.companyId,
    parsed.workspaceId,
    parsed.quotationId,
    {
      projectId: parsed.projectId,
      clientId: parsed.clientId,
      vendorId: parsed.vendorId,
      category: parsed.category,
      currency: parsed.currency,
      referenceNumber: parsed.referenceNumber,
      issuedAt: parsed.issuedAt,
      dueAt: parsed.dueAt,
      notes: parsed.notes,
      internalNotes: parsed.internalNotes,
      documentContent:
        parsed.documentContent !== undefined
          ? parseQuotationDocumentContent(parsed.documentContent)
          : undefined,
      amount,
      tax,
      discount,
      updatedBy: parsed.updatedBy,
    },
  );

  recordFinanceAudit({
    action: "update",
    actorId: options.actorId,
    before,
    after,
    metadata: {
      event: buildFinanceEvent({
        name: "quotation_updated",
        financeId: after.id,
        actorId: options.actorId,
      }),
    },
  });
  await recordQuotationUpdatedActivity(after, options.actorId);
  if (linesReplaced) {
    await recordQuotationLineItemsReplacedActivity(after, options.actorId);
  }

  return { ...(after as Quotation), lineItems };
}

async function transitionQuotation(
  input: TransitionQuotationInput,
  to: QuotationStatus,
  options: QuotationActorOptions,
  hooks: {
    auditAction: "update" | "approve" | "reject" | "delete";
    eventName:
      | "quotation_sent"
      | "quotation_accepted"
      | "quotation_rejected"
      | "quotation_expired"
      | "quotation_voided";
    activity: (finance: Finance, actorId: string) => Promise<void>;
    patch?: Partial<{
      issuedAt: string | null;
      notes: string | null;
    }>;
  },
): Promise<Quotation> {
  const parsed = transitionQuotationSchema.parse(input);
  const before = await loadQuotation(parsed);
  assertTransition(before.status as QuotationStatus, to);

  const after = await updateFinanceById(
    parsed.companyId,
    parsed.workspaceId,
    parsed.quotationId,
    {
      status: to as FinanceStatus,
      issuedAt: hooks.patch?.issuedAt,
      notes:
        hooks.patch?.notes !== undefined
          ? hooks.patch.notes
          : parsed.note
            ? [before.notes, parsed.note].filter(Boolean).join("\n")
            : before.notes,
      updatedBy: options.actorId,
    },
  );

  recordFinanceAudit({
    action: hooks.auditAction,
    actorId: options.actorId,
    before,
    after,
    metadata: {
      transition: `${before.status}→${to}`,
      event: buildFinanceEvent({
        name: hooks.eventName,
        financeId: after.id,
        actorId: options.actorId,
      }),
    },
  });
  await hooks.activity(after, options.actorId);
  return after as Quotation;
}

export async function sendQuotation(
  input: TransitionQuotationInput,
  options: QuotationActorOptions,
): Promise<Quotation> {
  const before = await loadQuotation(quotationIdSchema.parse(input));
  return transitionQuotation(input, "sent", options, {
    auditAction: "update",
    eventName: "quotation_sent",
    activity: recordQuotationSentActivity,
    patch: {
      issuedAt: before.issuedAt ?? new Date().toISOString(),
    },
  });
}

export async function acceptQuotation(
  input: TransitionQuotationInput,
  options: QuotationActorOptions,
): Promise<Quotation> {
  return transitionQuotation(input, "accepted", options, {
    auditAction: "approve",
    eventName: "quotation_accepted",
    activity: recordQuotationAcceptedActivity,
  });
}

export async function rejectQuotation(
  input: TransitionQuotationInput,
  options: QuotationActorOptions,
): Promise<Quotation> {
  return transitionQuotation(input, "rejected", options, {
    auditAction: "reject",
    eventName: "quotation_rejected",
    activity: recordQuotationRejectedActivity,
  });
}

export async function expireQuotation(
  input: TransitionQuotationInput,
  options: QuotationActorOptions,
): Promise<Quotation> {
  return transitionQuotation(input, "expired", options, {
    auditAction: "update",
    eventName: "quotation_expired",
    activity: recordQuotationExpiredActivity,
  });
}

export async function voidQuotation(
  input: TransitionQuotationInput,
  options: QuotationActorOptions,
): Promise<Quotation> {
  return transitionQuotation(input, "void", options, {
    auditAction: "delete",
    eventName: "quotation_voided",
    activity: recordQuotationVoidedActivity,
  });
}

export async function convertQuotationToInvoice(
  input: QuotationIdInput,
  options: QuotationActorOptions,
): Promise<{ quotation: Quotation; invoice: Finance; lineItems: FinanceLineItem[] }> {
  const parsed = quotationIdSchema.parse(input);
  const quotation = await loadQuotation(parsed);

  if (quotation.status !== "accepted") {
    throw new CoreError(
      "QUOTATION_NOT_ACCEPTED",
      "Only accepted quotations can be converted to invoices.",
    );
  }
  if (quotation.convertedInvoiceId) {
    throw new CoreError(
      "QUOTATION_ALREADY_CONVERTED",
      "Quotation has already been converted to an invoice.",
    );
  }

  const sourceLines = await listLineItems(quotation.id);
  const invoice = await insertFinance({
    companyId: quotation.companyId,
    workspaceId: quotation.workspaceId,
    projectId: quotation.projectId,
    clientId: quotation.clientId,
    vendorId: quotation.vendorId,
    type: "invoice",
    category: quotation.category,
    currency: quotation.currency,
    amount: quotation.amount,
    tax: quotation.tax,
    discount: quotation.discount,
    status: "open",
    referenceNumber: quotation.referenceNumber
      ? `INV-${quotation.referenceNumber}`
      : null,
    issuedAt: new Date().toISOString(),
    dueAt: quotation.dueAt,
    notes: quotation.notes,
    internalNotes: quotation.internalNotes,
    createdBy: options.actorId,
  });

  const lineItems =
    sourceLines.length > 0
      ? await replaceLineItems(
          invoice.id,
          quotation.companyId,
          quotation.workspaceId,
          sourceLines.map((line) => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            tax: line.tax,
            discount: line.discount,
            amount: line.amount,
          })),
        )
      : [];

  const updatedQuotation = await updateFinanceById(
    quotation.companyId,
    quotation.workspaceId,
    quotation.id,
    {
      convertedInvoiceId: invoice.id,
      updatedBy: options.actorId,
    },
  );

  recordFinanceAudit({
    action: "create",
    actorId: options.actorId,
    before: null,
    after: invoice,
    metadata: {
      sourceQuotationId: quotation.id,
      event: buildFinanceEvent({
        name: "quotation_converted",
        financeId: quotation.id,
        actorId: options.actorId,
        payload: { invoiceId: invoice.id },
      }),
    },
  });
  recordFinanceAudit({
    action: "update",
    actorId: options.actorId,
    before: quotation,
    after: updatedQuotation,
    metadata: {
      convertedInvoiceId: invoice.id,
      transition: "accepted→converted",
    },
  });
  await recordQuotationConvertedActivity(
    updatedQuotation,
    options.actorId,
    invoice.id,
  );

  return {
    quotation: updatedQuotation as Quotation,
    invoice,
    lineItems,
  };
}
