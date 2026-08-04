"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import {
  generateFinanceDocument,
  getFinanceDocumentDownloadUrl,
  renderFinanceDocumentHtml,
} from "@/document/engine/service";
import type { DocumentKind } from "@/document/engine/types";
import { createFinanceDocumentSignedUrl } from "@/document/engine/storage";
import { findLatestFinanceDocument } from "@/document/engine/repository";

export type DocumentEngineActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type DocumentScope = {
  financeId: string;
  workspaceId: string;
  companyId: string;
  kind?: DocumentKind;
};

function revalidateDocumentPaths(financeId: string) {
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/quotations");
  revalidatePath(`/dashboard/finance/quotations/${financeId}`);
  revalidatePath(`/dashboard/finance/quotations/${financeId}/document`);
}

async function requireFinanceRead(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "finance.read",
  );
}

export async function previewFinanceDocumentAction(
  input: DocumentScope,
): Promise<
  DocumentEngineActionResult<{ html?: string; signedUrl?: string; version?: number }>
> {
  try {
    const userId = await requireSessionUserId();
    await requireFinanceRead(userId, input.workspaceId, input.companyId);
    const kind = input.kind ?? "quotation";

    const existing = await findLatestFinanceDocument({
      financeId: input.financeId,
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      kind,
    }).catch((error) => {
      if (
        error instanceof CoreError &&
        error.code === "DOCUMENT_STORE_UNAVAILABLE"
      ) {
        return null;
      }
      throw error;
    });

    if (existing) {
      const signedUrl = await createFinanceDocumentSignedUrl({
        storagePath: existing.storagePath,
        filename: existing.filename,
      });
      return {
        ok: true,
        data: { signedUrl, version: existing.version },
      };
    }

    const { html } = await renderFinanceDocumentHtml({
      financeId: input.financeId,
      workspaceId: input.workspaceId,
      companyId: input.companyId,
      kind,
    });

    return { ok: true, data: { html } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to preview document"),
    };
  }
}

export async function downloadFinanceDocumentAction(
  input: DocumentScope,
): Promise<
  DocumentEngineActionResult<{ signedUrl: string; filename: string; version: number }>
> {
  try {
    const userId = await requireSessionUserId();
    await requireFinanceRead(userId, input.workspaceId, input.companyId);
    const kind = input.kind ?? "quotation";

    const result = await getFinanceDocumentDownloadUrl({
      financeId: input.financeId,
      workspaceId: input.workspaceId,
      companyId: input.companyId,
      kind,
      actorId: userId,
    });

    const signedUrl = await createFinanceDocumentSignedUrl({
      storagePath: result.document.storagePath,
      download: true,
      filename: result.document.filename,
    });

    revalidateDocumentPaths(input.financeId);
    return {
      ok: true,
      data: {
        signedUrl,
        filename: result.document.filename,
        version: result.document.version,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to download document"),
    };
  }
}

export async function regenerateFinanceDocumentAction(
  input: DocumentScope,
): Promise<
  DocumentEngineActionResult<{ signedUrl: string; filename: string; version: number }>
> {
  try {
    const userId = await requireSessionUserId();
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    const kind = input.kind ?? "quotation";

    const result = await generateFinanceDocument({
      financeId: input.financeId,
      workspaceId: input.workspaceId,
      companyId: input.companyId,
      kind,
      actorId: userId,
      force: true,
    });

    revalidateDocumentPaths(input.financeId);
    return {
      ok: true,
      data: {
        signedUrl: result.signedUrl,
        filename: result.document.filename,
        version: result.document.version,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to regenerate document"),
    };
  }
}
