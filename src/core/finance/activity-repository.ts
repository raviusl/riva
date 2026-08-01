import "server-only";

import type {
  CreateFinanceActivityInput,
  FinanceActivity,
  FinanceActivityType,
  ListFinanceActivitiesQuery,
} from "@/core/finance/activity-types";
import { createAdminClient } from "@/lib/supabase/admin";

export function mapFinanceActivityRow(
  data: Record<string, unknown>,
): FinanceActivity {
  const metadata = data.metadata;
  return {
    id: data.id as string,
    financeId: data.finance_id as string,
    workspaceId: data.workspace_id as string,
    companyId: data.company_id as string,
    actorId: (data.actor_id as string | null | undefined) ?? null,
    activityType: data.activity_type as FinanceActivityType,
    message: data.message as string,
    metadata:
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : {},
    createdAt: data.created_at as string,
  };
}

export async function createFinanceActivity(
  input: CreateFinanceActivityInput,
): Promise<FinanceActivity> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("finance_activities")
    .insert({
      finance_id: input.financeId,
      workspace_id: input.workspaceId,
      company_id: input.companyId,
      actor_id: input.actorId,
      activity_type: input.activityType,
      message: input.message,
      metadata: (input.metadata ?? {}) as unknown as import("@/types/database").Json,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("createFinanceActivity returned no row");
  }

  return mapFinanceActivityRow(data as Record<string, unknown>);
}

export async function listFinanceActivities(
  query: ListFinanceActivitiesQuery,
): Promise<FinanceActivity[]> {
  const admin = createAdminClient();
  let builder = admin
    .from("finance_activities")
    .select("*")
    .eq("workspace_id", query.workspaceId)
    .eq("company_id", query.companyId)
    .order("created_at", { ascending: false })
    .limit(query.limit ?? 100);

  if (query.financeId) {
    builder = builder.eq("finance_id", query.financeId);
  }

  const { data, error } = await builder;
  if (error) throw error;

  return (data ?? []).map((row) =>
    mapFinanceActivityRow(row as Record<string, unknown>),
  );
}
