import "server-only";

import { createElement, type ReactElement } from "react";

import { CoreError } from "@/core/errors";
import { loadQuotationDocumentPayload } from "@/document/engine/loaders/quotation";
import { renderHtmlToPdf } from "@/document/engine/pdf";
import { renderDocumentHtml } from "@/document/engine/render";
import {
  findLatestFinanceDocument,
  insertFinanceDocument,
  nextDocumentVersion,
} from "@/document/engine/repository";
import {
  buildFinanceDocumentStoragePath,
  createFinanceDocumentSignedUrl,
  uploadFinanceDocumentPdf,
} from "@/document/engine/storage";
import type {
  DocumentKind,
  FinanceDocumentPayload,
  FinanceDocumentRecord,
  GenerateDocumentInput,
  GeneratedDocumentResult,
} from "@/document/engine/types";
import { QuotationDocument } from "@/document/templates/quotation/quotation-document";

type TemplateRenderer = {
  loadPayload: (input: {
    financeId: string;
    workspaceId: string;
    companyId: string;
  }) => Promise<FinanceDocumentPayload>;
  renderBody: (payload: FinanceDocumentPayload) => ReactElement;
  buildFilename: (payload: FinanceDocumentPayload, version: number) => string;
  title: (payload: FinanceDocumentPayload) => string;
};

const TEMPLATE_REGISTRY: Partial<Record<DocumentKind, TemplateRenderer>> = {
  quotation: {
    loadPayload: loadQuotationDocumentPayload,
    renderBody: (payload) =>
      createElement(QuotationDocument, { payload }),
    buildFilename: (payload, version) =>
      `${payload.quotation.referenceNumber}-v${version}.pdf`,
    title: (payload) => `Quotation ${payload.quotation.referenceNumber}`,
  },
};

function resolveTemplate(kind: DocumentKind): TemplateRenderer {
  const template = TEMPLATE_REGISTRY[kind];
  if (!template) {
    throw new CoreError(
      "DOCUMENT_KIND_UNSUPPORTED",
      `Document kind "${kind}" is not supported yet.`,
    );
  }
  return template;
}

export async function renderFinanceDocumentHtml(input: {
  financeId: string;
  workspaceId: string;
  companyId: string;
  kind: DocumentKind;
}): Promise<{ html: string; payload: FinanceDocumentPayload }> {
  const template = resolveTemplate(input.kind);
  const payload = await template.loadPayload(input);
  const html = await renderDocumentHtml(
    template.title(payload),
    template.renderBody(payload),
  );
  return { html, payload };
}

export async function generateFinanceDocument(
  input: GenerateDocumentInput,
): Promise<GeneratedDocumentResult> {
  const template = resolveTemplate(input.kind);

  if (!input.force) {
    try {
      const existing = await findLatestFinanceDocument({
        financeId: input.financeId,
        companyId: input.companyId,
        workspaceId: input.workspaceId,
        kind: input.kind,
      });
      if (existing) {
        const signedUrl = await createFinanceDocumentSignedUrl({
          storagePath: existing.storagePath,
          filename: existing.filename,
        });
        return { document: existing, signedUrl };
      }
    } catch (error) {
      if (
        !(error instanceof CoreError) ||
        error.code !== "DOCUMENT_STORE_UNAVAILABLE"
      ) {
        throw error;
      }
      // Store table missing — continue and return an ephemeral PDF below.
    }
  }

  const payload = await template.loadPayload({
    financeId: input.financeId,
    workspaceId: input.workspaceId,
    companyId: input.companyId,
  });

  let version = 1;
  try {
    version = await nextDocumentVersion({
      financeId: input.financeId,
      kind: input.kind,
    });
  } catch (error) {
    if (
      !(error instanceof CoreError) ||
      error.code !== "DOCUMENT_STORE_UNAVAILABLE"
    ) {
      throw error;
    }
  }

  const filename = template.buildFilename(payload, version);
  const html = await renderDocumentHtml(
    template.title(payload),
    template.renderBody(payload),
  );

  const pdfBytes = await renderHtmlToPdf({
    html,
    title: template.title(payload),
  });

  const storagePath = buildFinanceDocumentStoragePath({
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    financeId: input.financeId,
    kind: input.kind,
    version,
    filename,
  });

  const uploaded = await uploadFinanceDocumentPdf({
    storagePath,
    bytes: pdfBytes,
  });

  let document: FinanceDocumentRecord;
  try {
    document = await insertFinanceDocument({
      workspaceId: input.workspaceId,
      companyId: input.companyId,
      financeId: input.financeId,
      documentKind: input.kind,
      version,
      status: "ready",
      storageBucket: uploaded.bucket,
      storagePath: uploaded.path,
      filename,
      mimeType: "application/pdf",
      sizeBytes: uploaded.sizeBytes,
      generatedBy: input.actorId,
      metadata: {
        referenceNumber: payload.quotation.referenceNumber,
        kind: input.kind,
      },
    });
  } catch (error) {
    if (
      !(error instanceof CoreError) ||
      error.code !== "DOCUMENT_STORE_UNAVAILABLE"
    ) {
      throw error;
    }
    // Ephemeral record when finance_documents is not migrated yet.
    const now = new Date().toISOString();
    document = {
      id: `ephemeral-${input.financeId}`,
      workspaceId: input.workspaceId,
      companyId: input.companyId,
      financeId: input.financeId,
      documentKind: input.kind,
      version,
      status: "ready",
      storageBucket: uploaded.bucket,
      storagePath: uploaded.path,
      filename,
      mimeType: "application/pdf",
      sizeBytes: uploaded.sizeBytes,
      generatedBy: input.actorId,
      generatedAt: now,
      metadata: {
        referenceNumber: payload.quotation.referenceNumber,
        kind: input.kind,
        ephemeral: true,
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  const signedUrl = await createFinanceDocumentSignedUrl({
    storagePath: document.storagePath,
    filename: document.filename,
  });

  return { document, signedUrl };
}

export async function getFinanceDocumentDownloadUrl(input: {
  financeId: string;
  workspaceId: string;
  companyId: string;
  kind: DocumentKind;
  actorId: string;
  forceGenerate?: boolean;
}): Promise<GeneratedDocumentResult> {
  return generateFinanceDocument({
    financeId: input.financeId,
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    kind: input.kind,
    actorId: input.actorId,
    force: input.forceGenerate,
  });
}

export async function getLatestFinanceDocument(input: {
  financeId: string;
  workspaceId: string;
  companyId: string;
  kind: DocumentKind;
}): Promise<FinanceDocumentRecord | null> {
  return findLatestFinanceDocument(input);
}
