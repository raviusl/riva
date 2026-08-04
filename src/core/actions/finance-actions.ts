"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import {
  acceptQuotation,
  convertQuotationToInvoice,
  createQuotation,
  expireQuotation,
  getQuotation,
  listQuotationActivityFeed,
  listQuotations,
  rejectQuotation,
  sendQuotation,
  updateQuotation,
  voidQuotation,
} from "@/core/finance/quotation";
import type {
  CreateQuotationInput,
  ListQuotationsQuery,
  QuotationIdInput,
  TransitionQuotationInput,
  UpdateQuotationInput,
} from "@/core/finance/schema";
import { requireMembershipPermission } from "@/core/membership/memberships";

export type FinanceActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateFinancePaths(quotationId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/workspace");
  revalidatePath("/dashboard/finance/quotations");
  if (quotationId) {
    revalidatePath(`/dashboard/finance/quotations/${quotationId}`);
    revalidatePath(`/dashboard/finance/quotations/${quotationId}/edit`);
  }
}

async function requireFinancePermission(
  userId: string,
  workspaceId: string,
  companyId: string,
  permission:
    | "finance.read"
    | "finance.write"
    | "finance.delete"
    | "finance.approve",
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    permission,
  );
}

export async function listQuotationsAction(
  input: ListQuotationsQuery,
): Promise<FinanceActionResult<{ quotations: Awaited<ReturnType<typeof listQuotations>> }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.read",
    );
    const quotations = await listQuotations(input);
    return { ok: true, data: { quotations } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to list quotations"),
    };
  }
}

export async function getQuotationAction(
  input: QuotationIdInput,
): Promise<
  FinanceActionResult<{
    quotation: Awaited<ReturnType<typeof getQuotation>>;
  }>
> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.read",
    );
    const quotation = await getQuotation(input);
    return { ok: true, data: { quotation } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load quotation"),
    };
  }
}

export async function listQuotationActivitiesAction(
  input: QuotationIdInput,
): Promise<
  FinanceActionResult<{
    activities: Awaited<ReturnType<typeof listQuotationActivityFeed>>;
  }>
> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.read",
    );
    const activities = await listQuotationActivityFeed(input);
    return { ok: true, data: { activities } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to list quotation activities"),
    };
  }
}

export async function createQuotationAction(
  input: Omit<CreateQuotationInput, "createdBy">,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    const quotation = await createQuotation(
      { ...input, createdBy: userId },
      { actorId: userId },
    );
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create quotation"),
    };
  }
}

export async function updateQuotationAction(
  input: Omit<UpdateQuotationInput, "updatedBy">,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    const quotation = await updateQuotation(
      { ...input, updatedBy: userId },
      { actorId: userId },
    );
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update quotation"),
    };
  }
}

export async function sendQuotationAction(
  input: TransitionQuotationInput,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    const quotation = await sendQuotation(input, { actorId: userId });
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to send quotation"),
    };
  }
}

export async function acceptQuotationAction(
  input: TransitionQuotationInput,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    try {
      await requireFinancePermission(
        userId,
        input.workspaceId,
        input.companyId,
        "finance.approve",
      );
    } catch {
      await requireFinancePermission(
        userId,
        input.workspaceId,
        input.companyId,
        "finance.write",
      );
    }
    const quotation = await acceptQuotation(input, { actorId: userId });
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to accept quotation"),
    };
  }
}

export async function rejectQuotationAction(
  input: TransitionQuotationInput,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    const quotation = await rejectQuotation(input, { actorId: userId });
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to reject quotation"),
    };
  }
}

export async function expireQuotationAction(
  input: TransitionQuotationInput,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    const quotation = await expireQuotation(input, { actorId: userId });
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to expire quotation"),
    };
  }
}

export async function voidQuotationAction(
  input: TransitionQuotationInput,
): Promise<FinanceActionResult<{ quotationId: string }>> {
  try {
    const userId = await requireSessionUserId();
    try {
      await requireFinancePermission(
        userId,
        input.workspaceId,
        input.companyId,
        "finance.delete",
      );
    } catch {
      await requireFinancePermission(
        userId,
        input.workspaceId,
        input.companyId,
        "finance.approve",
      );
    }
    const quotation = await voidQuotation(input, { actorId: userId });
    revalidateFinancePaths(quotation.id);
    return { ok: true, data: { quotationId: quotation.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to void quotation"),
    };
  }
}

export async function convertQuotationToInvoiceAction(
  input: QuotationIdInput,
): Promise<FinanceActionResult<{ quotationId: string; invoiceId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireFinancePermission(
      userId,
      input.workspaceId,
      input.companyId,
      "finance.write",
    );
    try {
      await requireFinancePermission(
        userId,
        input.workspaceId,
        input.companyId,
        "finance.approve",
      );
    } catch {
      // Allow convert with write when approve is not granted (sales/coordinator).
    }
    const result = await convertQuotationToInvoice(input, { actorId: userId });
    revalidateFinancePaths(result.quotation.id);
    return {
      ok: true,
      data: {
        quotationId: result.quotation.id,
        invoiceId: result.invoice.id,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to convert quotation"),
    };
  }
}
