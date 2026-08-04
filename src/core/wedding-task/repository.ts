import "server-only";

import type {
  WeddingTaskActivity,
  WeddingTaskAttachment,
  WeddingTaskComment,
  WeddingProjectTask,
} from "@/core/wedding-task/types";
import {
  WEDDING_TASK_PRIORITIES,
  WEDDING_TASK_STATUSES,
  type WeddingTaskPriority,
  type WeddingTaskStatus,
} from "@/core/wedding-task/constants";
import { createAdminClient } from "@/lib/supabase/admin";

function asAttachments(value: unknown): WeddingTaskAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is WeddingTaskAttachment =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as WeddingTaskAttachment).id === "string" &&
      typeof (row as WeddingTaskAttachment).name === "string",
  );
}

function asComments(value: unknown): WeddingTaskComment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is WeddingTaskComment =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as WeddingTaskComment).id === "string" &&
      typeof (row as WeddingTaskComment).body === "string" &&
      typeof (row as WeddingTaskComment).createdAt === "string",
  );
}

function asActivity(value: unknown): WeddingTaskActivity[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is WeddingTaskActivity =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as WeddingTaskActivity).id === "string" &&
      typeof (row as WeddingTaskActivity).action === "string" &&
      typeof (row as WeddingTaskActivity).createdAt === "string",
  );
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is string => typeof row === "string");
}

function asStatus(value: unknown): WeddingTaskStatus {
  const raw = String(value ?? "todo");
  return (WEDDING_TASK_STATUSES as readonly string[]).includes(raw)
    ? (raw as WeddingTaskStatus)
    : "todo";
}

function asPriority(value: unknown): WeddingTaskPriority {
  const raw = String(value ?? "normal");
  return (WEDDING_TASK_PRIORITIES as readonly string[]).includes(raw)
    ? (raw as WeddingTaskPriority)
    : "normal";
}

function asDate(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  return value.slice(0, 10);
}

export function mapWeddingProjectTaskRow(
  data: Record<string, unknown>,
): WeddingProjectTask {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    sequence: Number(data.sequence ?? 0),
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    status: asStatus(data.status),
    priority: asPriority(data.priority),
    due_date: asDate(data.due_date),
    start_date: asDate(data.start_date),
    completed_at: (data.completed_at as string | null) ?? null,
    reminder_minutes:
      typeof data.reminder_minutes === "number"
        ? data.reminder_minutes
        : null,
    assignee_label: (data.assignee_label as string | null) ?? null,
    assignee_person_id: (data.assignee_person_id as string | null) ?? null,
    client_id: (data.client_id as string | null) ?? null,
    vendor_id: (data.vendor_id as string | null) ?? null,
    coordinator_label: (data.coordinator_label as string | null) ?? null,
    package_label: (data.package_label as string | null) ?? null,
    tags: asTags(data.tags),
    attachments: asAttachments(data.attachments),
    comments: asComments(data.comments),
    activity_log: asActivity(data.activity_log),
    internal_notes: (data.internal_notes as string | null) ?? null,
    archived_at: (data.archived_at as string | null) ?? null,
    created_by: (data.created_by as string | null) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertWeddingProjectTaskRow = {
  workspace_id: string;
  company_id: string;
  project_id: string;
  sequence: number;
  title: string;
  description?: string | null;
  status: WeddingTaskStatus;
  priority: WeddingTaskPriority;
  due_date?: string | null;
  start_date?: string | null;
  completed_at?: string | null;
  reminder_minutes?: number | null;
  assignee_label?: string | null;
  assignee_person_id?: string | null;
  client_id?: string | null;
  vendor_id?: string | null;
  coordinator_label?: string | null;
  package_label?: string | null;
  tags?: string[];
  attachments?: WeddingTaskAttachment[];
  comments?: WeddingTaskComment[];
  activity_log?: WeddingTaskActivity[];
  internal_notes?: string | null;
  created_by?: string | null;
};

export type UpdateWeddingProjectTaskRow = Partial<
  Omit<
    InsertWeddingProjectTaskRow,
    "workspace_id" | "company_id" | "project_id" | "title"
  >
> & {
  title?: string;
  archived_at?: string | null;
};

export async function insertWeddingProjectTask(
  row: InsertWeddingProjectTaskRow,
): Promise<WeddingProjectTask> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_project_tasks")
    .insert(row as never)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertWeddingProjectTask returned no row");
  }
  return mapWeddingProjectTaskRow(data as Record<string, unknown>);
}

export async function findWeddingProjectTaskById(
  taskId: string,
  workspaceId?: string,
): Promise<WeddingProjectTask | null> {
  const admin = createAdminClient();
  let query = admin.from("wedding_project_tasks").select("*").eq("id", taskId);
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapWeddingProjectTaskRow(data as Record<string, unknown>);
}

export async function findWeddingProjectTasksByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
  options?: { includeArchived?: boolean },
): Promise<WeddingProjectTask[]> {
  const admin = createAdminClient();
  let query = admin
    .from("wedding_project_tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("sequence", { ascending: true })
    .order("due_date", { ascending: true });

  if (!options?.includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) =>
    mapWeddingProjectTaskRow(row as Record<string, unknown>),
  );
}

export async function updateWeddingProjectTaskById(
  taskId: string,
  patch: UpdateWeddingProjectTaskRow,
): Promise<WeddingProjectTask> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_project_tasks")
    .update({ ...patch, updated_at: new Date().toISOString() } as never)
    .eq("id", taskId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateWeddingProjectTaskById returned no row");
  }
  return mapWeddingProjectTaskRow(data as Record<string, unknown>);
}

export async function deleteWeddingProjectTaskById(
  taskId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("wedding_project_tasks")
    .delete()
    .eq("id", taskId);
  if (error) throw error;
}

export async function applyWeddingTaskSequences(
  updates: Array<{ id: string; sequence: number }>,
): Promise<void> {
  const admin = createAdminClient();
  for (const row of updates) {
    const { error } = await admin
      .from("wedding_project_tasks")
      .update({
        sequence: row.sequence,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", row.id);
    if (error) throw error;
  }
}
