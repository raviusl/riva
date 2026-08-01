/**
 * Finance activity types (Project 089).
 */

export const FINANCE_ACTIVITY_TYPES = [
  "quotation_created",
  "quotation_updated",
  "quotation_sent",
  "quotation_accepted",
  "quotation_rejected",
  "quotation_expired",
  "quotation_voided",
  "quotation_converted",
  "quotation_line_items_replaced",
] as const;

export type FinanceActivityType = (typeof FINANCE_ACTIVITY_TYPES)[number];

export type FinanceActivity = {
  id: string;
  financeId: string;
  workspaceId: string;
  companyId: string;
  actorId: string | null;
  activityType: FinanceActivityType;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type CreateFinanceActivityInput = {
  financeId: string;
  workspaceId: string;
  companyId: string;
  actorId: string | null;
  activityType: FinanceActivityType;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ListFinanceActivitiesQuery = {
  financeId?: string;
  workspaceId: string;
  companyId: string;
  limit?: number;
};
