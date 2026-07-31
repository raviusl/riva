import "server-only";

import type {
  CreateTaskActivityInput,
  ListTaskActivitiesQuery,
  TaskActivity,
  TaskActivityType,
} from "@/core/task/activity-types";
import { createAdminClient } from "@/lib/supabase/admin";

export function mapTaskActivityRow(data: Record<string, unknown>): TaskActivity {
  const metadata = data.metadata;
  return {
    id: data.id as string,
    taskId: (data.task_id as string | null | undefined) ?? null,
    workspaceId: data.workspace_id as string,
    companyId: data.company_id as string,
    actorId: data.actor_id as string,
    activityType: data.activity_type as TaskActivityType,
    message: data.message as string,
    metadata:
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : {},
    createdAt: data.created_at as string,
  };
}

export async function createTaskActivity(
  input: CreateTaskActivityInput,
): Promise<TaskActivity> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("task_activities")
    .insert({
      task_id: input.taskId,
      workspace_id: input.workspaceId,
      company_id: input.companyId,
      actor_id: input.actorId,
      activity_type: input.activityType,
      message: input.message,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("createTaskActivity returned no row");
  }

  return mapTaskActivityRow(data as Record<string, unknown>);
}

export async function listTaskActivities(
  query: ListTaskActivitiesQuery,
): Promise<TaskActivity[]> {
  const admin = createAdminClient();
  let builder = admin
    .from("task_activities")
    .select("*")
    .eq("workspace_id", query.workspaceId)
    .eq("company_id", query.companyId)
    .order("created_at", { ascending: false })
    .limit(query.limit ?? 100);

  if (query.taskId) {
    builder = builder.eq("task_id", query.taskId);
  }

  const { data, error } = await builder;
  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapTaskActivityRow(row as Record<string, unknown>),
  );
}
