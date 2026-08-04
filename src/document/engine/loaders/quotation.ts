import "server-only";

import { getClientById } from "@/core/client/client";
import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import {
  formatCompanyBankDetails,
  parseQuotationDocumentContent,
} from "@/core/finance/document-content";
import { calculateTotal } from "@/core/finance/service";
import { getQuotation } from "@/core/finance/quotation";
import { getProjectById } from "@/core/project/project";
import { getWorkspaceById } from "@/core/workspace/workspace";
import type { FinanceDocumentPayload } from "@/document/engine/types";

export async function loadQuotationDocumentPayload(input: {
  financeId: string;
  workspaceId: string;
  companyId: string;
}): Promise<FinanceDocumentPayload> {
  const [quotation, company, workspace] = await Promise.all([
    getQuotation({
      quotationId: input.financeId,
      workspaceId: input.workspaceId,
      companyId: input.companyId,
    }),
    getCompanyById(input.companyId, input.workspaceId),
    getWorkspaceById(input.workspaceId),
  ]);

  if (company.workspace_id !== input.workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }

  const content = parseQuotationDocumentContent(
    quotation.documentContent ?? {},
  );
  const companyBank =
    content.bankDetails?.trim() ||
    formatCompanyBankDetails({
      companyName: company.name,
      accountName: company.bank_account_name,
      bankName: company.bank_name,
      accountNumber: company.bank_account_number,
      swiftCode: company.swift_code,
    });

  const [client, project] = await Promise.all([
    quotation.clientId
      ? getClientById(
          quotation.clientId,
          input.workspaceId,
          input.companyId,
        ).catch(() => null)
      : Promise.resolve(null),
    quotation.projectId
      ? getProjectById(quotation.projectId, input.workspaceId)
          .then((row) =>
            row.company_id === input.companyId ? row : null,
          )
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const lineItems = quotation.lineItems.map((item, index) => ({
    position: item.position ?? index,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    tax: item.tax,
    discount: item.discount,
    amount: item.amount,
    itemKind: item.itemKind ?? "line",
    unitOfMeasure: item.unitOfMeasure ?? null,
    notes: item.notes ?? null,
  }));

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const packageDiscount = content.pricing.packageDiscount ?? 0;
  const manualDiscount = content.pricing.manualDiscount ?? 0;
  const discountTotal =
    quotation.discount + packageDiscount + manualDiscount;
  const grandTotal = calculateTotal({
    amount: quotation.amount,
    tax: quotation.tax,
    discount: quotation.discount,
  });
  const deposit =
    content.pricing.depositAmount ??
    (content.pricing.depositPercent != null
      ? Math.round(
          ((grandTotal * content.pricing.depositPercent) / 100 +
            Number.EPSILON) *
            100,
        ) / 100
      : null);
  const balance =
    content.pricing.balanceAmount ??
    (deposit != null
      ? Math.round((grandTotal - deposit + Number.EPSILON) * 100) / 100
      : null);

  const billToName = content.billTo?.name?.trim() || client?.name || null;

  return {
    kind: "quotation",
    generatedAt: new Date().toISOString(),
    company: {
      id: company.id,
      name: company.name,
      logoUrl: company.logo_url,
      registrationNo: company.registration_no,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      country: company.country,
      timezone: company.timezone,
      locale: company.locale,
      currency: company.currency ?? "USD",
      bankName: company.bank_name ?? null,
      bankAccountName: company.bank_account_name ?? null,
      bankAccountNumber: company.bank_account_number ?? null,
      swiftCode: company.swift_code ?? null,
    },
    workspace: {
      id: workspace.id,
      name: workspace.name,
      logoUrl: workspace.logo_url,
      timezone: workspace.timezone,
      locale: workspace.locale,
      currency: workspace.currency ?? "USD",
    },
    client: client
      ? {
          id: client.id,
          name: billToName || client.name,
          email: content.billTo.email || client.email,
          phone: content.billTo.phone || client.phone,
        }
      : billToName
        ? {
            id: "bill-to",
            name: billToName,
            email: content.billTo.email,
            phone: content.billTo.phone,
          }
        : null,
    project: project
      ? {
          id: project.id,
          name: content.event?.title?.trim() || project.name,
          description:
            content.eventNotes ??
            content.event?.notes ??
            project.description ??
            null,
          startDate: content.event?.date ?? project.start_date ?? null,
          endDate: project.end_date,
          projectType: project.project_type,
        }
      : content.event?.title
        ? {
            id: "event",
            name: content.event.title,
            description: content.eventNotes ?? content.event.notes ?? null,
            startDate: content.event.date ?? null,
            endDate: null,
            projectType: null,
          }
        : null,
    lineItems,
    money: {
      currency: quotation.currency,
      subtotal: Math.round((subtotal + Number.EPSILON) * 100) / 100,
      tax: quotation.tax,
      discount: Math.round((discountTotal + Number.EPSILON) * 100) / 100,
      total: grandTotal,
      deposit,
      balance,
    },
    quotation: {
      id: quotation.id,
      referenceNumber:
        quotation.referenceNumber?.trim() ||
        quotation.id.slice(0, 8).toUpperCase(),
      status: quotation.status,
      issuedAt: quotation.issuedAt,
      dueAt: quotation.dueAt,
      notes: quotation.notes,
      yourReference: content.yourReference ?? null,
      preparedBy: content.preparedBy ?? null,
      salesPerson: content.salesPerson ?? null,
      cc: content.cc ?? null,
      attentionTo: content.attentionTo ?? null,
      contactPerson: content.contactPerson ?? null,
      paymentTerms:
        content.paymentTerms?.trim() ||
        company.default_payment_terms?.trim() ||
        "",
      termsAndConditions:
        content.termsAndConditions?.trim() ||
        company.default_terms_and_conditions ||
        null,
      bankDetails: companyBank,
      paymentReference: content.paymentReference ?? null,
      validityLabel: content.validityLabel ?? null,
      deliveryTerm: content.deliveryTerm ?? null,
      eventNotes: content.eventNotes ?? content.event.notes ?? null,
    },
    content,
    remarks: quotation.notes,
      footerNote:
      content.footer?.trim() ||
      company.default_document_footer?.trim() ||
      "Thank you for choosing Ruyan Weddings.\nWe appreciate the opportunity to be part of your celebration.\nThis is a computer-generated quotation.\nNo signature is required.",
  };
}
