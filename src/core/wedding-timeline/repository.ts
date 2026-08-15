import "server-only";

import type {
  WeddingTimelineAssignment,
  WeddingTimelineAttachment,
  WeddingTimelineChecklistItem,
  WeddingTimelineItem,
  WeddingTimelineItemDependency,
  WeddingTimelineSchedule,
} from "@/core/wedding-timeline/types";
import {
  WEDDING_TIMELINE_ASSIGNMENT_ROLES,
  WEDDING_TIMELINE_ASSIGNMENT_TYPES,
  WEDDING_TIMELINE_ITEM_TYPES,
  WEDDING_TIMELINE_PHASES,
  WEDDING_TIMELINE_PRIORITIES,
  WEDDING_TIMELINE_SCHEDULE_STATES,
  WEDDING_TIMELINE_SOURCES,
  WEDDING_TIMELINE_STATUSES,
  type WeddingTimelineAssignmentRole,
  type WeddingTimelineAssignmentType,
  type WeddingTimelineItemType,
  type WeddingTimelinePhase,
  type WeddingTimelinePriority,
  type WeddingTimelineScheduleState,
  type WeddingTimelineSource,
  type WeddingTimelineStatus,
} from "@/core/wedding-timeline/constants";
import {
  clockTimeFromInstant,
  scheduledEndFromStartAndDuration,
} from "@/core/wedding-timeline/time";
import { createAdminClient } from "@/lib/supabase/admin";

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

function asItemType(value: unknown): WeddingTimelineItemType {
  const raw = String(value ?? "activity");
  return (WEDDING_TIMELINE_ITEM_TYPES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelineItemType)
    : "activity";
}

function asPhase(value: unknown): WeddingTimelinePhase | null {
  if (value == null || value === "") return null;
  const raw = String(value);
  return (WEDDING_TIMELINE_PHASES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelinePhase)
    : null;
}

function asSource(value: unknown): WeddingTimelineSource {
  const raw = String(value ?? "manual");
  return (WEDDING_TIMELINE_SOURCES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelineSource)
    : "manual";
}

function asScheduleState(value: unknown): WeddingTimelineScheduleState {
  const raw = String(value ?? "draft");
  return (WEDDING_TIMELINE_SCHEDULE_STATES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelineScheduleState)
    : "draft";
}

function asAssignmentType(value: unknown): WeddingTimelineAssignmentType {
  const raw = String(value ?? "Staff");
  return (WEDDING_TIMELINE_ASSIGNMENT_TYPES as readonly string[]).includes(raw)
    ? (raw as WeddingTimelineAssignmentType)
    : "Staff";
}

function assignmentTypeToLegacyRole(
  type: WeddingTimelineAssignmentType,
): WeddingTimelineAssignmentRole {
  switch (type) {
    case "Photographer":
      return "photographer";
    case "Videographer":
      return "videographer";
    case "MC":
      return "mc";
    case "Musician":
      return "singer";
    case "Couple":
      return "bride";
    case "Family":
      return "family";
    case "Vendor":
      return "venue";
    case "Owner":
      return "coordinator";
    case "Staff":
    default:
      return "coordinator";
  }
}

function legacyRoleToAssignmentType(
  role: string | null | undefined,
): WeddingTimelineAssignmentType {
  switch ((role ?? "").toLowerCase()) {
    case "photographer":
      return "Photographer";
    case "videographer":
      return "Videographer";
    case "mc":
      return "MC";
    case "singer":
    case "band":
      return "Musician";
    case "bride":
    case "groom":
      return "Couple";
    case "family":
    case "parents":
      return "Family";
    case "venue":
    case "hotel":
    case "makeup_artist":
    case "decorator":
      return "Vendor";
    default:
      return "Staff";
  }
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

function mapAssignmentRow(
  data: Record<string, unknown>,
): WeddingTimelineAssignment {
  const assignmentType = asAssignmentType(data.assignment_type);
  const legacyRole = (WEDDING_TIMELINE_ASSIGNMENT_ROLES as readonly string[]).includes(
    String(data.legacy_role ?? ""),
  )
    ? (data.legacy_role as WeddingTimelineAssignmentRole)
    : assignmentTypeToLegacyRole(assignmentType);

  return {
    id: data.id as string,
    role: legacyRole,
    label: (data.display_name as string | null) ?? assignmentType,
    personId: (data.person_id as string | null) ?? null,
    assignmentType,
    vendorId: (data.vendor_id as string | null) ?? null,
  };
}

export function mapWeddingTimelineScheduleRow(
  data: Record<string, unknown>,
): WeddingTimelineSchedule {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    timeline_state: asScheduleState(data.timeline_state),
    previous_execution_state: data.previous_execution_state
      ? asScheduleState(data.previous_execution_state)
      : null,
    emergency_unlock_until:
      (data.emergency_unlock_until as string | null) ?? null,
    emergency_unlock_by: (data.emergency_unlock_by as string | null) ?? null,
    confirmed_at: (data.confirmed_at as string | null) ?? null,
    ready_at: (data.ready_at as string | null) ?? null,
    live_at: (data.live_at as string | null) ?? null,
    completed_at: (data.completed_at as string | null) ?? null,
    archived_at: (data.archived_at as string | null) ?? null,
    cancelled_at: (data.cancelled_at as string | null) ?? null,
    paused_at: (data.paused_at as string | null) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    deleted_at: (data.deleted_at as string | null) ?? null,
  };
}

export function mapWeddingTimelineItemRow(
  data: Record<string, unknown>,
  options?: {
    timeZone?: string | null;
    assignments?: WeddingTimelineAssignment[];
    predecessorIds?: string[];
  },
): WeddingTimelineItem {
  const sortOrder = Number(
    data.sort_order ?? data.sequence ?? 0,
  );
  const scheduledStart = (data.scheduled_start as string | null) ?? null;
  const durationMinutes =
    typeof data.duration_minutes === "number" ? data.duration_minutes : null;
  const scheduledEnd =
    (data.scheduled_end as string | null) ??
    scheduledEndFromStartAndDuration(scheduledStart, durationMinutes);
  const startTime = clockTimeFromInstant(scheduledStart, options?.timeZone);
  const endTime = clockTimeFromInstant(scheduledEnd, options?.timeZone);
  const predecessorIds = options?.predecessorIds ?? [];

  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    sort_order: sortOrder,
    sequence: sortOrder,
    scheduled_start: scheduledStart,
    duration_minutes: durationMinutes,
    scheduled_end: scheduledEnd,
    start_time: startTime,
    end_time: endTime,
    title: data.title as string,
    description: (data.description as string | null) ?? null,
    category: (data.category as string | null) ?? null,
    phase: asPhase(data.phase),
    item_type: asItemType(data.item_type),
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
    assignments: options?.assignments ?? [],
    checklist: asChecklist(data.checklist),
    attachments: asAttachments(data.attachments),
    internal_notes: (data.internal_notes as string | null) ?? null,
    depends_on_id: predecessorIds[0] ?? null,
    predecessor_ids: predecessorIds,
    buffer_before_minutes:
      typeof data.buffer_before_minutes === "number"
        ? data.buffer_before_minutes
        : null,
    buffer_after_minutes:
      typeof data.buffer_after_minutes === "number"
        ? data.buffer_after_minutes
        : null,
    package_item_id: (data.package_item_id as string | null) ?? null,
    source: asSource(data.source),
    actual_start_at: (data.actual_start_at as string | null) ?? null,
    actual_end_at: (data.actual_end_at as string | null) ?? null,
    delay_minutes:
      typeof data.delay_minutes === "number" ? data.delay_minutes : null,
    archived_at: (data.archived_at as string | null) ?? null,
    created_by: (data.created_by as string | null) ?? null,
    updated_by: (data.updated_by as string | null) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertWeddingTimelineItemRow = {
  workspace_id: string;
  company_id: string;
  project_id: string;
  sort_order: number;
  scheduled_start?: string | null;
  duration_minutes?: number | null;
  scheduled_end?: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  phase?: WeddingTimelinePhase | null;
  item_type?: WeddingTimelineItemType;
  location?: string | null;
  status: WeddingTimelineStatus;
  priority: WeddingTimelinePriority;
  reminder_minutes?: number | null;
  pic_label?: string | null;
  vendor_id?: string | null;
  coordinator_label?: string | null;
  crew?: string | null;
  checklist?: WeddingTimelineChecklistItem[];
  attachments?: WeddingTimelineAttachment[];
  internal_notes?: string | null;
  buffer_before_minutes?: number | null;
  buffer_after_minutes?: number | null;
  package_item_id?: string | null;
  source?: WeddingTimelineSource;
  actual_start_at?: string | null;
  actual_end_at?: string | null;
  delay_minutes?: number | null;
  created_by?: string | null;
  updated_by?: string | null;
};

export type UpdateWeddingTimelineItemRow = Partial<
  Omit<
    InsertWeddingTimelineItemRow,
    "workspace_id" | "company_id" | "project_id" | "title"
  >
> & {
  title?: string;
  archived_at?: string | null;
};

async function loadAssignmentsByItemIds(
  itemIds: string[],
): Promise<Map<string, WeddingTimelineAssignment[]>> {
  const map = new Map<string, WeddingTimelineAssignment[]>();
  if (itemIds.length === 0) return map;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("timeline_assignments")
    .select("*")
    .in("timeline_item_id", itemIds)
    .is("deleted_at", null);
  if (error) throw error;
  for (const row of data ?? []) {
    const record = row as Record<string, unknown>;
    const itemId = record.timeline_item_id as string;
    const list = map.get(itemId) ?? [];
    list.push(mapAssignmentRow(record));
    map.set(itemId, list);
  }
  return map;
}

async function loadPredecessorsByItemIds(
  itemIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (itemIds.length === 0) return map;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_item_dependencies")
    .select("successor_item_id, predecessor_item_id")
    .in("successor_item_id", itemIds)
    .is("deleted_at", null);
  if (error) throw error;
  for (const row of data ?? []) {
    const successor = row.successor_item_id as string;
    const predecessor = row.predecessor_item_id as string;
    const list = map.get(successor) ?? [];
    list.push(predecessor);
    map.set(successor, list);
  }
  return map;
}

async function hydrateItems(
  rows: Record<string, unknown>[],
  timeZone?: string | null,
): Promise<WeddingTimelineItem[]> {
  const ids = rows.map((row) => row.id as string);
  const [assignments, predecessors] = await Promise.all([
    loadAssignmentsByItemIds(ids),
    loadPredecessorsByItemIds(ids),
  ]);
  return rows.map((row) =>
    mapWeddingTimelineItemRow(row, {
      timeZone,
      assignments: assignments.get(row.id as string) ?? [],
      predecessorIds: predecessors.get(row.id as string) ?? [],
    }),
  );
}

export async function insertWeddingTimelineItem(
  row: InsertWeddingTimelineItemRow,
  options?: { timeZone?: string | null },
): Promise<WeddingTimelineItem> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_items")
    .insert({
      ...row,
      // Legacy columns left untouched / defaulted — not SoT.
      sequence: row.sort_order,
      assignments: [],
    } as never)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertWeddingTimelineItem returned no row");
  }
  const [item] = await hydrateItems(
    [data as Record<string, unknown>],
    options?.timeZone,
  );
  return item!;
}

export async function findWeddingTimelineItemById(
  itemId: string,
  workspaceId?: string,
  options?: { timeZone?: string | null },
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
  const [item] = await hydrateItems(
    [data as Record<string, unknown>],
    options?.timeZone,
  );
  return item ?? null;
}

export async function findWeddingTimelineItemsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
  options?: { includeArchived?: boolean; timeZone?: string | null },
): Promise<WeddingTimelineItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("wedding_timeline_items")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("scheduled_start", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!options?.includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return hydrateItems(
    (data ?? []) as Record<string, unknown>[],
    options?.timeZone,
  );
}

export async function updateWeddingTimelineItemById(
  itemId: string,
  patch: UpdateWeddingTimelineItemRow,
  options?: { timeZone?: string | null },
): Promise<WeddingTimelineItem> {
  const admin = createAdminClient();
  const payload: Record<string, unknown> = {
    ...patch,
    updated_at: new Date().toISOString(),
  };
  if (patch.sort_order != null) {
    // Keep legacy sequence in sync for any leftover readers; not write SoT.
    payload.sequence = patch.sort_order;
  }
  const { data, error } = await admin
    .from("wedding_timeline_items")
    .update(payload as never)
    .eq("id", itemId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateWeddingTimelineItemById returned no row");
  }
  const [item] = await hydrateItems(
    [data as Record<string, unknown>],
    options?.timeZone,
  );
  return item!;
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

export async function applyWeddingTimelineSortOrders(
  updates: Array<{ id: string; sort_order: number }>,
): Promise<void> {
  const admin = createAdminClient();
  for (const row of updates) {
    const { error } = await admin
      .from("wedding_timeline_items")
      .update({
        sort_order: row.sort_order,
        sequence: row.sort_order,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", row.id);
    if (error) throw error;
  }
}

/** @deprecated use applyWeddingTimelineSortOrders */
export async function applyWeddingTimelineSequences(
  updates: Array<{ id: string; sequence: number }>,
): Promise<void> {
  return applyWeddingTimelineSortOrders(
    updates.map((row) => ({ id: row.id, sort_order: row.sequence })),
  );
}

export async function replaceTimelineAssignmentsForItem(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  itemId: string;
  assignments: Array<{
    id?: string;
    role?: string | null;
    assignmentType?: WeddingTimelineAssignmentType;
    label: string;
    personId?: string | null;
    vendorId?: string | null;
  }>;
}): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { error: softDeleteError } = await admin
    .from("timeline_assignments")
    .update({ deleted_at: now, updated_at: now } as never)
    .eq("timeline_item_id", input.itemId)
    .is("deleted_at", null);
  if (softDeleteError) throw softDeleteError;

  if (input.assignments.length === 0) return;

  const rows = input.assignments.map((row) => {
    const assignmentType =
      row.assignmentType ?? legacyRoleToAssignmentType(row.role);
    const displayName = row.label.trim() || assignmentType;
    return {
      id:
        row.id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          row.id,
        )
          ? row.id
          : crypto.randomUUID(),
      workspace_id: input.workspaceId,
      company_id: input.companyId,
      project_id: input.projectId,
      timeline_item_id: input.itemId,
      assignment_type: assignmentType,
      person_id: row.personId ?? null,
      display_name: displayName,
      vendor_id: row.vendorId ?? null,
      deleted_at: null,
      updated_at: now,
    };
  });

  const { error } = await admin
    .from("timeline_assignments")
    .upsert(rows as never, { onConflict: "id" });
  if (error) throw error;
}

export async function replaceItemPredecessors(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  successorItemId: string;
  predecessorIds: string[];
}): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { error: softDeleteError } = await admin
    .from("wedding_timeline_item_dependencies")
    .update({ deleted_at: now, updated_at: now } as never)
    .eq("successor_item_id", input.successorItemId)
    .is("deleted_at", null);
  if (softDeleteError) throw softDeleteError;

  const unique = [...new Set(input.predecessorIds)].filter(
    (id) => id !== input.successorItemId,
  );
  if (unique.length === 0) return;

  const rows = unique.map((predecessorId) => ({
    workspace_id: input.workspaceId,
    company_id: input.companyId,
    project_id: input.projectId,
    predecessor_item_id: predecessorId,
    successor_item_id: input.successorItemId,
    deleted_at: null,
    updated_at: now,
  }));

  const { error } = await admin
    .from("wedding_timeline_item_dependencies")
    .insert(rows as never);
  if (error) throw error;
}

export function mapDependencyRow(
  data: Record<string, unknown>,
): WeddingTimelineItemDependency {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: data.project_id as string,
    predecessor_item_id: data.predecessor_item_id as string,
    successor_item_id: data.successor_item_id as string,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    deleted_at: (data.deleted_at as string | null) ?? null,
  };
}

export async function findWeddingTimelineScheduleByProject(
  projectId: string,
): Promise<WeddingTimelineSchedule | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_schedules")
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapWeddingTimelineScheduleRow(data as Record<string, unknown>);
}

export async function insertWeddingTimelineSchedule(input: {
  workspace_id: string;
  company_id: string;
  project_id: string;
  timeline_state?: WeddingTimelineScheduleState;
}): Promise<WeddingTimelineSchedule> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_schedules")
    .insert({
      workspace_id: input.workspace_id,
      company_id: input.company_id,
      project_id: input.project_id,
      timeline_state: input.timeline_state ?? "draft",
    } as never)
    .select("*")
    .single();
  if (error || !data) {
    throw error ?? new Error("insertWeddingTimelineSchedule returned no row");
  }
  return mapWeddingTimelineScheduleRow(data as Record<string, unknown>);
}

export async function updateWeddingTimelineScheduleByProject(
  projectId: string,
  patch: Partial<{
    timeline_state: WeddingTimelineScheduleState;
    previous_execution_state: WeddingTimelineScheduleState | null;
    emergency_unlock_until: string | null;
    emergency_unlock_by: string | null;
    confirmed_at: string | null;
    ready_at: string | null;
    live_at: string | null;
    completed_at: string | null;
    archived_at: string | null;
    cancelled_at: string | null;
    paused_at: string | null;
  }>,
): Promise<WeddingTimelineSchedule> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wedding_timeline_schedules")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .select("*")
    .single();
  if (error || !data) {
    throw error ?? new Error("updateWeddingTimelineScheduleByProject failed");
  }
  return mapWeddingTimelineScheduleRow(data as Record<string, unknown>);
}
