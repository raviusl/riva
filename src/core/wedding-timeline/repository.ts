import "server-only";

import type {
  WeddingTimelineAssignment,
  WeddingTimelineAttachment,
  WeddingTimelineChecklistItem,
  WeddingTimelineItem,
} from "@/core/wedding-timeline/types";
import {
  WEDDING_TIMELINE_PRIORITIES,
  WEDDING_TIMELINE_STATUSES,
  type WeddingTimelinePriority,
  type WeddingTimelineStatus,
} from "@/core/wedding-timeline/constants";
import { normalizeTime } from "@/core/wedding-timeline/time";
import { createAdminClient } from "@/lib/supabase/admin";

function asAssignments(value: unknown): WeddingTimelineAssignment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is WeddingTimelineAssignment =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as WeddingTimelineAssignment).id === "string" &&
      typeof (row as WeddingTimelineAssignment).label === "string",
  );
}

function asChecklist(value: unknown): WeddingTimelineChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is WeddingTimelineChecklistItem =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as WeddingTimelineChecklistItem).id === "string" &&
      typeof (row as WeddingTimelineChecklistItem).label === "string",
  );
}

function asAttachments(value: unknown): WeddingTimelineAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is WeddingTimelineAttachment =>
      Boolean(row) &&
      typeof row === "object" &&
      typeof (row as WeddingTimelineAttachment).id === "string" &&
      typeof (row as WeddingTimelineAttachment).name === "string",
  );
}

function asStatus(value: unknown): WeddingTimelineStatus {
  const raw = String(value ?? "not_started");
  return (WEDDING_TIMELINE_STATUSES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelineStatus)
    : "not_started";
}

function asPriority(value: unknown): WeddingTimelinePriority {
  const raw = String(value ?? "normal");
  return (WEDDING_TIMELINE_PRIORITIES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelinePriority)
    : "normal";
}

export function mapWeddingTimelineItemRow(
  data: Record<string, unknown>,
): WeddingTimelineItem {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    sequence: Number(data.sequence ?? 0),
    start_time: normalizeTime(
      typeof data.start_time === "string" ? data.start_time.slice(0, 8) : null,
    ),
    end_time: normalizeTime(
      typeof data.end_time === "string" ? data.end_time.slice(0, 8) : null,
    ),
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    category: (data.category as string | null) ?? null,
    location: (data.location as string | null) ?? null,
    status: asStatus(data.status),
    priority: asPriority(data.priority),
    reminder_minutes:
      typeof data.reminder_minutes === "number"
        ? data.reminder_minutes
        : null,
    pic_label: (data.pic_label as string | null) ?? null,
    vendor_id: (data.vendor_id as string | null) ?? null,
    coordinator_label: (data.coordinator_label as string | null) ?? null,
    crew: (data.crew as string | null) ?? null,
    assignments: asAssignments(data.assignments),
    checklist: asChecklist(data.checklist),
    attachments: asAttachments(data.attachments),
    internal_notes: (data.internal_notes as string | null) ?? null,
    depends_on_id: (data.depends_on_id as string | null) ?? null,
    archived_at: (data.archived_at as string | null) ?? null,
    created_by: (data.created_by as string | null) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertWeddingTimelineItemRow = {
  workspace_id: string;
  company_id: string;
  project_id: string;
  sequence: number;
  start_time?: string | null;
  end_time?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  status: WeddingTimelineStatus;
  priority: WeddingTimelinePriority;
  reminder_minutes?: number | null;
  pic_label?: string | null;
  vendor_id?: string | null;
  coordinator_label?: string | null;
  crew?: string | null;
  assignments?: WeddingTimelineAssignment[];
  checklist?: WeddingTimelineChecklistItem[];
  attachments?: WeddingTimelineAttachment[];
  internal_notes?: string | null;
  depends_on_id?: string | null;
  created_by?: string | null;
};

export type UpdateWeddingTimelineItemRow = Partial<
  Omit<InsertWeddingTimelineItemRow, "workspace_id" | "company_id" | "project_id" | "title">
> & {
  title?: string;
  archived_at?: string | null;
};

export async function insertWeddingTimelineItem(
  row: InsertWeddingTimelineItemRow,
): Promise<WeddingTimelineItem> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_items")
    .insert(row as never)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertWeddingTimelineItem returned no row");
  }
  return mapWeddingTimelineItemRow(data as Record<string, unknown>);
}

export async function findWeddingTimelineItemById(
  itemId: string,
  workspaceId?: string,
): Promise<WeddingTimelineItem | null> {
  const admin = createAdminClient();
  let query = admin
    .from("wedding_timeline_items")
    .select("*")
    .eq("id", itemId);
  if (workspaceId) query = query.eq("workspace_id", workspaceId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapWeddingTimelineItemRow(data as Record<string, unknown>);
}

export async function findWeddingTimelineItemsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
  options?: { includeArchived?: boolean },
): Promise<WeddingTimelineItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("wedding_timeline_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("sequence", { ascending: true })
    .order("start_time", { ascending: true });

  if (!options?.includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) =>
    mapWeddingTimelineItemRow(row as Record<string, unknown>),
  );
}

export async function updateWeddingTimelineItemById(
  itemId: string,
  patch: UpdateWeddingTimelineItemRow,
): Promise<WeddingTimelineItem> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_items")
    .update({ ...patch, updated_at: new Date().toISOString() } as never)
    .eq("id", itemId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateWeddingTimelineItemById returned no row");
  }
  return mapWeddingTimelineItemRow(data as Record<string, unknown>);
}

export async function deleteWeddingTimelineItemById(
  itemId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("wedding_timeline_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
}

export async function applyWeddingTimelineSequences(
  updates: Array<{ id: string; sequence: number }>,
): Promise<void> {
  const admin = createAdminClient();
  for (const row of updates) {
    const { error } = await admin
      .from("wedding_timeline_items")
      .update({
        sequence: row.sequence,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", row.id);
    if (error) throw error;
  }
}
