import "server-only";

import type {
  CreateFinanceActivityInput,
  FinanceActivity,
  ListFinanceActivitiesQuery,
} from "@/core/finance/activity-types";
import {
  createFinanceActivity as createFinanceActivityRow,
  listFinanceActivities as listFinanceActivityRows,
} from "@/core/finance/activity-repository";
import type { Finance } from "@/core/finance/types";
import { CoreError } from "@/core/errors";

async function recordActivity(input: CreateFinanceActivityInput): Promise<void> {
  try {
    await createFinanceActivityRow(input);
  } catch (error) {
    console.error("recordFinanceActivity failed", error);
  }
}

function quotationLabel(finance: Finance): string {
  return finance.referenceNumber?.trim() || finance.id.slice(0, 8);
}

export async function listQuotationActivities(
  query: ListFinanceActivitiesQuery,
): Promise<FinanceActivity[]> {
  try {
    return await listFinanceActivityRows(query);
  } catch (error) {
    console.error("listQuotationActivities failed", error);
    throw new CoreError(
      "FINANCE_ACTIVITY_LIST_FAILED",
      "Failed to list quotation activities.",
    );
  }
}

export async function recordQuotationCreatedActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_created",
    message: `Created quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationUpdatedActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_updated",
    message: `Updated quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationLineItemsReplacedActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_line_items_replaced",
    message: `Updated line items on "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationSentActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_sent",
    message: `Sent quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationAcceptedActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_accepted",
    message: `Accepted quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationRejectedActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_rejected",
    message: `Rejected quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationExpiredActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_expired",
    message: `Expired quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationVoidedActivity(
  finance: Finance,
  actorId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_voided",
    message: `Voided quotation "${label}"`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
    },
  });
}

export async function recordQuotationConvertedActivity(
  finance: Finance,
  actorId: string,
  invoiceId: string,
): Promise<void> {
  const label = quotationLabel(finance);
  await recordActivity({
    financeId: finance.id,
    workspaceId: finance.workspaceId,
    companyId: finance.companyId,
    actorId,
    activityType: "quotation_converted",
    message: `Converted quotation "${label}" to invoice`,
    metadata: {
      referenceNumber: finance.referenceNumber,
      targetType: "quotation",
      targetId: finance.id,
      invoiceId,
    },
  });
}
