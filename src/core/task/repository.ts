import "server-only";

import type {
  AssignTaskInput,
  CreateTaskInput,
  ListTasksQuery,
  UnassignTaskInput,
  UpdateTaskInput,
} from "@/core/task/schema";
import type { Task, TaskId, TaskPriority, TaskStatus } from "@/core/task/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Task persistence contract.
 */
export interface TaskRepository {
  getTaskById(taskId: TaskId, workspaceId?: string): Promise<Task | null>;
  listTasks(query: ListTasksQuery): Promise<Task[]>;
  listTasksByProject(
    workspaceId: string,
    companyId: string,
    relatedProjectId: string,
  ): Promise<Task[]>;
  listTasksByClient(
    workspaceId: string,
    companyId: string,
    relatedClientId: string,
  ): Promise<Task[]>;
  listTasksByVendor(
    workspaceId: string,
    companyId: string,
    relatedVendorId: string,
  ): Promise<Task[]>;
  listTasksByMeeting(
    workspaceId: string,
    companyId: string,
    relatedMeetingId: string,
  ): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(input: UpdateTaskInput): Promise<Task>;
  deleteTask(taskId: TaskId, workspaceId?: string): Promise<void>;
  assignTask(input: AssignTaskInput): Promise<Task>;
  unassignTask(input: UnassignTaskInput): Promise<Task>;
}

export function mapTaskRow(data: Record<string, unknown>): Task {
  const followers = data.followers;
  const tags = data.tags;
  return {
    id: data.id as string,
    workspaceId: data.workspace_id as string,
    companyId: data.company_id as string,
    title: data.title as string,
    description: (data.description as string | null | undefined) ?? null,
    status: data.status as TaskStatus,
    priority: data.priority as TaskPriority,
    startDate: (data.start_date as string | null | undefined) ?? null,
    dueDate: (data.due_date as string | null | undefined) ?? null,
    completedDate: (data.completed_date as string | null | undefined) ?? null,
    ownerId: (data.owner_id as string | null | undefined) ?? null,
    assigneeId: (data.assignee_id as string | null | undefined) ?? null,
    followers: Array.isArray(followers) ? (followers as string[]) : [],
    relatedProjectId:
      (data.related_project_id as string | null | undefined) ?? null,
    relatedClientId:
      (data.related_client_id as string | null | undefined) ?? null,
    relatedVendorId:
      (data.related_vendor_id as string | null | undefined) ?? null,
    relatedMeetingId:
      (data.related_meeting_id as string | null | undefined) ?? null,
    tags: Array.isArray(tags) ? (tags as string[]) : [],
    archivedAt: (data.archived_at as string | null | undefined) ?? null,
    createdBy: data.created_by as string,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function getTaskById(
  taskId: TaskId,
  workspaceId?: string,
): Promise<Task | null> {
  const admin = createAdminClient();
  let query = admin.from("workspace_tasks").select("*").eq("id", taskId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return mapTaskRow(data as Record<string, unknown>);
}

export async function listTasks(query: ListTasksQuery): Promise<Task[]> {
  const admin = createAdminClient();
  let builder = admin
    .from("workspace_tasks")
    .select("*")
    .eq("workspace_id", query.workspaceId)
    .eq("company_id", query.companyId);

  if (query.relatedProjectId) {
    builder = builder.eq("related_project_id", query.relatedProjectId);
  }
  if (query.relatedClientId) {
    builder = builder.eq("related_client_id", query.relatedClientId);
  }
  if (query.relatedVendorId) {
    builder = builder.eq("related_vendor_id", query.relatedVendorId);
  }
  if (query.relatedMeetingId) {
    builder = builder.eq("related_meeting_id", query.relatedMeetingId);
  }
  if (query.ownerId) {
    builder = builder.eq("owner_id", query.ownerId);
  }
  if (query.assigneeId) {
    builder = builder.eq("assignee_id", query.assigneeId);
  }
  if (query.status) {
    builder = builder.eq("status", query.status);
  }
  if (query.priority) {
    builder = builder.eq("priority", query.priority);
  }
  if (!query.includeArchived) {
    builder = builder.is("archived_at", null);
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapTaskRow(row as Record<string, unknown>),
  );
}

export async function listTasksByProject(
  workspaceId: string,
  companyId: string,
  relatedProjectId: string,
): Promise<Task[]> {
  return listTasks({
    workspaceId,
    companyId,
    relatedProjectId,
  });
}

export async function listTasksByClient(
  workspaceId: string,
  companyId: string,
  relatedClientId: string,
): Promise<Task[]> {
  return listTasks({
    workspaceId,
    companyId,
    relatedClientId,
  });
}

export async function listTasksByVendor(
  workspaceId: string,
  companyId: string,
  relatedVendorId: string,
): Promise<Task[]> {
  return listTasks({
    workspaceId,
    companyId,
    relatedVendorId,
  });
}

export async function listTasksByMeeting(
  workspaceId: string,
  companyId: string,
  relatedMeetingId: string,
): Promise<Task[]> {
  return listTasks({
    workspaceId,
    companyId,
    relatedMeetingId,
  });
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const admin = createAdminClient();
  const status = input.status ?? "todo";
  const { data, error } = await admin
    .from("workspace_tasks")
    .insert({
      workspace_id: input.workspaceId,
      company_id: input.companyId,
      title: input.title,
      description: input.description ?? null,
      status,
      priority: input.priority ?? "normal",
      start_date: input.startDate ?? null,
      due_date: input.dueDate ?? null,
      completed_date:
        input.completedDate ??
        (status === "completed"
          ? new Date().toISOString().slice(0, 10)
          : null),
      owner_id: input.ownerId ?? input.createdBy,
      assignee_id: input.assigneeId ?? null,
      followers: input.followers ?? [],
      related_project_id: input.relatedProjectId ?? null,
      related_client_id: input.relatedClientId ?? null,
      related_vendor_id: input.relatedVendorId ?? null,
      related_meeting_id: input.relatedMeetingId ?? null,
      tags: input.tags ?? [],
      created_by: input.createdBy,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("createTask returned no row");
  }

  return mapTaskRow(data as Record<string, unknown>);
}

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const admin = createAdminClient();
  const patch: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    start_date?: string | null;
    due_date?: string | null;
    completed_date?: string | null;
    owner_id?: string | null;
    assignee_id?: string | null;
    followers?: string[];
    related_project_id?: string | null;
    related_client_id?: string | null;
    related_vendor_id?: string | null;
    related_meeting_id?: string | null;
    tags?: string[];
    archived_at?: string | null;
  } = {};

  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.startDate !== undefined) patch.start_date = input.startDate;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate;
  if (input.completedDate !== undefined) {
    patch.completed_date = input.completedDate;
  }
  if (input.ownerId !== undefined) patch.owner_id = input.ownerId;
  if (input.assigneeId !== undefined) patch.assignee_id = input.assigneeId;
  if (input.followers !== undefined) patch.followers = input.followers;
  if (input.relatedProjectId !== undefined) {
    patch.related_project_id = input.relatedProjectId;
  }
  if (input.relatedClientId !== undefined) {
    patch.related_client_id = input.relatedClientId;
  }
  if (input.relatedVendorId !== undefined) {
    patch.related_vendor_id = input.relatedVendorId;
  }
  if (input.relatedMeetingId !== undefined) {
    patch.related_meeting_id = input.relatedMeetingId;
  }
  if (input.tags !== undefined) patch.tags = input.tags;

  const { data, error } = await admin
    .from("workspace_tasks")
    .update(patch)
    .eq("id", input.taskId)
    .eq("workspace_id", input.workspaceId)
    .eq("company_id", input.companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateTask returned no row");
  }

  return mapTaskRow(data as Record<string, unknown>);
}

export async function setTaskArchivedAt(
  taskId: string,
  workspaceId: string,
  companyId: string,
  archivedAt: string | null,
): Promise<Task> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspace_tasks")
    .update({ archived_at: archivedAt })
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("setTaskArchivedAt returned no row");
  }

  return mapTaskRow(data as Record<string, unknown>);
}

export async function deleteTask(
  taskId: TaskId,
  workspaceId?: string,
): Promise<void> {
  const admin = createAdminClient();
  let query = admin.from("workspace_tasks").delete().eq("id", taskId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { error } = await query;
  if (error) {
    throw error;
  }
}

export async function assignTask(input: AssignTaskInput): Promise<Task> {
  const admin = createAdminClient();
  const patch =
    input.role === "owner"
      ? { owner_id: input.userId }
      : { assignee_id: input.userId };

  const { data, error } = await admin
    .from("workspace_tasks")
    .update(patch)
    .eq("id", input.taskId)
    .eq("workspace_id", input.workspaceId)
    .eq("company_id", input.companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("assignTask returned no row");
  }

  return mapTaskRow(data as Record<string, unknown>);
}

export async function unassignTask(input: UnassignTaskInput): Promise<Task> {
  const admin = createAdminClient();
  const patch =
    input.role === "owner"
      ? { owner_id: null }
      : { assignee_id: null };

  const { data, error } = await admin
    .from("workspace_tasks")
    .update(patch)
    .eq("id", input.taskId)
    .eq("workspace_id", input.workspaceId)
    .eq("company_id", input.companyId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("unassignTask returned no row");
  }

  return mapTaskRow(data as Record<string, unknown>);
}

/** Concrete repository used by TaskService. */
export const taskRepository: TaskRepository = {
  getTaskById,
  listTasks,
  listTasksByProject,
  listTasksByClient,
  listTasksByVendor,
  listTasksByMeeting,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
};
