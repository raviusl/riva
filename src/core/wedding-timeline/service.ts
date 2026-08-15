import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  bulkWeddingTimelineSchema,
  createWeddingTimelineItemSchema,
  ensureWeddingTimelineScheduleSchema,
  reorderWeddingTimelineSchema,
  shiftWeddingTimelineSchema,
  updateWeddingTimelineItemSchema,
  updateWeddingTimelineScheduleStateSchema,
  weddingTimelineItemIdSchema,
  type BulkWeddingTimelineInput,
  type CreateWeddingTimelineItemInput,
  type EnsureWeddingTimelineScheduleInput,
  type ReorderWeddingTimelineInput,
  type ShiftWeddingTimelineInput,
  type UpdateWeddingTimelineItemInput,
  type UpdateWeddingTimelineScheduleStateInput,
  type WeddingTimelineItemIdInput,
} from "@/core/wedding-timeline/schema";
import {
  applyWeddingTimelineSortOrders,
  deleteWeddingTimelineItemById,
  findWeddingTimelineItemById,
  findWeddingTimelineItemsByProject,
  findWeddingTimelineScheduleByProject,
  insertWeddingTimelineItem,
  insertWeddingTimelineSchedule,
  replaceItemPredecessors,
  replaceTimelineAssignmentsForItem,
  updateWeddingTimelineItemById,
  updateWeddingTimelineScheduleByProject,
} from "@/core/wedding-timeline/repository";
import type {
  WeddingTimelineItem,
  WeddingTimelineSchedule,
} from "@/core/wedding-timeline/types";
import {
  addMinutesToIso,
  clockTimeFromInstant,
  durationMinutesFromTimes,
  instantFromLocalDateAndTime,
  scheduledEndFromStartAndDuration,
  timeToMinutes,
} from "@/core/wedding-timeline/time";
import { getWorkspaceById } from "@/core/workspace/workspace";

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function assertScope(
  workspaceId: string,
  companyId: string,
  projectId: string,
) {
  const workspace = await getWorkspaceById(workspaceId);
  const company = await getCompanyById(companyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
  const timeZone =
    company.timezone?.trim() || workspace.timezone || "UTC";
  return { project, company, workspace, timeZone };
}

export async function ensureWeddingTimelineSchedule(
  input: EnsureWeddingTimelineScheduleInput,
): Promise<WeddingTimelineSchedule> {
  const values = ensureWeddingTimelineScheduleSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const existing = await findWeddingTimelineScheduleByProject(values.projectId);
  if (existing) return existing;
  try {
    return await insertWeddingTimelineSchedule({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      project_id: values.projectId,
      timeline_state: "draft",
    });
  } catch (error) {
    // Race: unique project_id
    const again = await findWeddingTimelineScheduleByProject(values.projectId);
    if (again) return again;
    console.error("ensureWeddingTimelineSchedule failed", error);
    throw new CoreError(
      "WEDDING_TIMELINE_SCHEDULE_ENSURE_FAILED",
      "Failed to ensure timeline schedule.",
    );
  }
}

export async function getWeddingTimelineSchedule(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
}): Promise<WeddingTimelineSchedule> {
  return ensureWeddingTimelineSchedule(input);
}

export async function updateWeddingTimelineScheduleState(
  input: UpdateWeddingTimelineScheduleStateInput,
): Promise<WeddingTimelineSchedule> {
  const values = updateWeddingTimelineScheduleStateSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  await ensureWeddingTimelineSchedule(values);

  const now = new Date().toISOString();
  const patch: Parameters<typeof updateWeddingTimelineScheduleByProject>[1] = {
    timeline_state: values.timelineState,
  };
  switch (values.timelineState) {
    case "confirmed":
      patch.confirmed_at = now;
      break;
    case "ready":
      patch.ready_at = now;
      break;
    case "live":
      patch.live_at = now;
      break;
    case "completed":
      patch.completed_at = now;
      break;
    case "archived":
      patch.archived_at = now;
      break;
    case "cancelled":
      patch.cancelled_at = now;
      break;
    case "paused":
      patch.paused_at = now;
      break;
    default:
      break;
  }

  try {
    return await updateWeddingTimelineScheduleByProject(
      values.projectId,
      patch,
    );
  } catch (error) {
    console.error("updateWeddingTimelineScheduleState failed", error);
    throw new CoreError(
      "WEDDING_TIMELINE_SCHEDULE_UPDATE_FAILED",
      "Failed to update timeline schedule state.",
    );
  }
}

function resolveScheduledStart(input: {
  scheduledStart?: string | null;
  startTime?: string | null;
  weddingDate: string | null;
  timeZone: string;
}): string | null {
  if (input.scheduledStart) return input.scheduledStart;
  return instantFromLocalDateAndTime(
    input.weddingDate,
    input.startTime,
    input.timeZone,
  );
}

function resolveDuration(input: {
  durationMinutes?: number | null;
  startTime?: string | null;
  endTime?: string | null;
}): number | null {
  if (input.durationMinutes != null) return input.durationMinutes;
  return durationMinutesFromTimes(input.startTime, input.endTime);
}

async function syncAssignmentsAndDeps(
  values: {
    workspaceId: string;
    companyId: string;
    projectId: string;
    itemId: string;
    assignments?: CreateWeddingTimelineItemInput["assignments"];
    dependsOnId?: string | null;
    predecessorIds?: string[];
  },
  options: { syncAssignments: boolean; syncDeps: boolean },
) {
  if (options.syncAssignments && values.assignments) {
    await replaceTimelineAssignmentsForItem({
      workspaceId: values.workspaceId,
      companyId: values.companyId,
      projectId: values.projectId,
      itemId: values.itemId,
      assignments: values.assignments.map((row) => ({
        id: row.id,
        role: row.role,
        assignmentType: row.assignmentType,
        label: row.label,
        personId: row.personId,
        vendorId: row.vendorId,
      })),
    });
  }

  if (options.syncDeps) {
    const predecessorIds =
      values.predecessorIds ??
      (values.dependsOnId ? [values.dependsOnId] : []);
    await replaceItemPredecessors({
      workspaceId: values.workspaceId,
      companyId: values.companyId,
      projectId: values.projectId,
      successorItemId: values.itemId,
      predecessorIds,
    });
  }
}

export async function listWeddingTimelineItems(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<WeddingTimelineItem[]> {
  const { timeZone } = await assertScope(
    input.workspaceId,
    input.companyId,
    input.projectId,
  );
  await ensureWeddingTimelineSchedule(input);
  try {
    return await findWeddingTimelineItemsByProject(
      input.workspaceId,
      input.companyId,
      input.projectId,
      { includeArchived: input.includeArchived, timeZone },
    );
  } catch (error) {
    console.error("listWeddingTimelineItems failed", error);
    throw new CoreError(
      "WEDDING_TIMELINE_LIST_FAILED",
      "Failed to load wedding timeline.",
    );
  }
}

export async function createWeddingTimelineItem(
  input: CreateWeddingTimelineItemInput,
  actorId?: string,
): Promise<WeddingTimelineItem> {
  const values = createWeddingTimelineItemSchema.parse(input);
  const { project, timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
  await ensureWeddingTimelineSchedule(values);

  const existing = await findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
    { includeArchived: true, timeZone },
  );
  const nextSort =
    values.sortOrder ??
    values.sequence ??
    (existing.length === 0
      ? 0
      : Math.max(...existing.map((row) => row.sort_order)) + 1);

  const scheduledStart = resolveScheduledStart({
    scheduledStart: values.scheduledStart,
    startTime: values.startTime,
    weddingDate: project.wedding_date,
    timeZone,
  });
  const durationMinutes = resolveDuration({
    durationMinutes: values.durationMinutes,
    startTime: values.startTime,
    endTime: values.endTime,
  });
  const scheduledEnd = scheduledEndFromStartAndDuration(
    scheduledStart,
    durationMinutes,
  );

  try {
    const item = await insertWeddingTimelineItem(
      {
        workspace_id: values.workspaceId,
        company_id: values.companyId,
        project_id: values.projectId,
        sort_order: nextSort,
        scheduled_start: scheduledStart,
        duration_minutes: durationMinutes,
        scheduled_end: scheduledEnd,
        title: values.title.trim(),
        description: trimOrNull(values.description),
        category: trimOrNull(
          typeof values.category === "string" ? values.category : null,
        ),
        phase: values.phase ?? null,
        item_type: values.itemType ?? "activity",
        location: trimOrNull(values.location),
        status: values.status ?? "not_started",
        priority: values.priority ?? "normal",
        reminder_minutes: values.reminderMinutes ?? null,
        pic_label: trimOrNull(values.picLabel),
        vendor_id: values.vendorId ?? null,
        coordinator_label: trimOrNull(values.coordinatorLabel),
        crew: trimOrNull(values.crew),
        checklist: values.checklist ?? [],
        attachments: values.attachments ?? [],
        internal_notes: trimOrNull(values.internalNotes),
        buffer_before_minutes: values.bufferBeforeMinutes ?? null,
        buffer_after_minutes: values.bufferAfterMinutes ?? null,
        package_item_id: values.packageItemId ?? null,
        source: values.source ?? "manual",
        actual_start_at: values.actualStartAt ?? null,
        actual_end_at: values.actualEndAt ?? null,
        delay_minutes: values.delayMinutes ?? null,
        created_by: actorId ?? null,
        updated_by: actorId ?? null,
      },
      { timeZone },
    );

    await syncAssignmentsAndDeps(
      {
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        projectId: values.projectId,
        itemId: item.id,
        assignments: values.assignments,
        dependsOnId: values.dependsOnId,
        predecessorIds: values.predecessorIds,
      },
      {
        syncAssignments: values.assignments !== undefined,
        syncDeps:
          values.predecessorIds !== undefined ||
          values.dependsOnId !== undefined,
      },
    );

    return (
      (await findWeddingTimelineItemById(item.id, values.workspaceId, {
        timeZone,
      })) ?? item
    );
  } catch (error) {
    console.error("createWeddingTimelineItem failed", error);
    throw new CoreError(
      "WEDDING_TIMELINE_CREATE_FAILED",
      "Failed to create timeline item.",
    );
  }
}

export async function updateWeddingTimelineItem(
  input: UpdateWeddingTimelineItemInput,
  actorId?: string,
): Promise<WeddingTimelineItem> {
  const values = updateWeddingTimelineItemSchema.parse(input);
  const { project, timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
  const before = await findWeddingTimelineItemById(
    values.itemId,
    values.workspaceId,
    { timeZone },
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }

  const scheduledStart = resolveScheduledStart({
    scheduledStart: values.scheduledStart,
    startTime: values.startTime,
    weddingDate: project.wedding_date,
    timeZone,
  });
  const durationMinutes = resolveDuration({
    durationMinutes: values.durationMinutes,
    startTime: values.startTime,
    endTime: values.endTime,
  });
  const scheduledEnd = scheduledEndFromStartAndDuration(
    scheduledStart ?? before.scheduled_start,
    durationMinutes ?? before.duration_minutes,
  );

  try {
    const item = await updateWeddingTimelineItemById(
      before.id,
      {
        title: values.title.trim(),
        description: trimOrNull(values.description),
        scheduled_start: scheduledStart,
        duration_minutes: durationMinutes,
        scheduled_end: scheduledEnd,
        sort_order: values.sortOrder ?? values.sequence ?? before.sort_order,
        category: trimOrNull(
          typeof values.category === "string" ? values.category : null,
        ),
        phase: values.phase === undefined ? before.phase : values.phase,
        item_type: values.itemType ?? before.item_type,
        location: trimOrNull(values.location),
        status: values.status ?? before.status,
        priority: values.priority ?? before.priority,
        reminder_minutes:
          values.reminderMinutes !== undefined
            ? values.reminderMinutes
            : before.reminder_minutes,
        pic_label: trimOrNull(values.picLabel),
        vendor_id: values.vendorId ?? null,
        coordinator_label: trimOrNull(values.coordinatorLabel),
        crew: trimOrNull(values.crew),
        checklist: values.checklist ?? before.checklist,
        attachments: values.attachments ?? before.attachments,
        internal_notes: trimOrNull(values.internalNotes),
        buffer_before_minutes:
          values.bufferBeforeMinutes !== undefined
            ? values.bufferBeforeMinutes
            : before.buffer_before_minutes,
        buffer_after_minutes:
          values.bufferAfterMinutes !== undefined
            ? values.bufferAfterMinutes
            : before.buffer_after_minutes,
        package_item_id:
          values.packageItemId !== undefined
            ? values.packageItemId
            : before.package_item_id,
        source: values.source ?? before.source,
        actual_start_at:
          values.actualStartAt !== undefined
            ? values.actualStartAt
            : before.actual_start_at,
        actual_end_at:
          values.actualEndAt !== undefined
            ? values.actualEndAt
            : before.actual_end_at,
        delay_minutes:
          values.delayMinutes !== undefined
            ? values.delayMinutes
            : before.delay_minutes,
        updated_by: actorId ?? null,
      },
      { timeZone },
    );

    await syncAssignmentsAndDeps(
      {
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        projectId: values.projectId,
        itemId: item.id,
        assignments: values.assignments,
        dependsOnId: values.dependsOnId,
        predecessorIds: values.predecessorIds,
      },
      {
        syncAssignments: values.assignments !== undefined,
        syncDeps:
          values.predecessorIds !== undefined ||
          values.dependsOnId !== undefined,
      },
    );

    return (
      (await findWeddingTimelineItemById(item.id, values.workspaceId, {
        timeZone,
      })) ?? item
    );
  } catch (error) {
    console.error("updateWeddingTimelineItem failed", error);
    throw new CoreError(
      "WEDDING_TIMELINE_UPDATE_FAILED",
      "Failed to update timeline item.",
    );
  }
}

export async function duplicateWeddingTimelineItem(
  input: WeddingTimelineItemIdInput,
  actorId?: string,
): Promise<WeddingTimelineItem> {
  const values = weddingTimelineItemIdSchema.parse(input);
  const { timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
  const source = await findWeddingTimelineItemById(
    values.itemId,
    values.workspaceId,
    { timeZone },
  );
  if (!source || source.project_id !== values.projectId) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }

  return createWeddingTimelineItem(
    {
      workspaceId: values.workspaceId,
      companyId: values.companyId,
      projectId: values.projectId,
      title: `${source.title} (copy)`,
      description: source.description,
      scheduledStart: source.scheduled_start,
      durationMinutes: source.duration_minutes,
      category: source.category,
      phase: source.phase,
      itemType: source.item_type,
      location: source.location,
      status: "not_started",
      priority: source.priority,
      reminderMinutes: source.reminder_minutes,
      picLabel: source.pic_label,
      vendorId: source.vendor_id,
      coordinatorLabel: source.coordinator_label,
      crew: source.crew,
      assignments: source.assignments.map((row) => ({
        ...row,
        id: crypto.randomUUID(),
      })),
      checklist: source.checklist.map((row) => ({
        ...row,
        id: crypto.randomUUID(),
        done: false,
      })),
      attachments: [],
      internalNotes: source.internal_notes,
      sortOrder: source.sort_order + 1,
      bufferBeforeMinutes: source.buffer_before_minutes,
      bufferAfterMinutes: source.buffer_after_minutes,
      source: "manual",
    },
    actorId,
  );
}

export async function archiveWeddingTimelineItem(
  input: WeddingTimelineItemIdInput,
  actorId?: string,
): Promise<WeddingTimelineItem> {
  const values = weddingTimelineItemIdSchema.parse(input);
  const { timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
  const before = await findWeddingTimelineItemById(
    values.itemId,
    values.workspaceId,
    { timeZone },
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }
  if (before.archived_at) return before;
  return updateWeddingTimelineItemById(
    before.id,
    {
      archived_at: new Date().toISOString(),
      updated_by: actorId ?? null,
    },
    { timeZone },
  );
}

export async function restoreWeddingTimelineItem(
  input: WeddingTimelineItemIdInput,
  actorId?: string,
): Promise<WeddingTimelineItem> {
  const values = weddingTimelineItemIdSchema.parse(input);
  const { timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
  const before = await findWeddingTimelineItemById(
    values.itemId,
    values.workspaceId,
    { timeZone },
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }
  return updateWeddingTimelineItemById(
    before.id,
    { archived_at: null, updated_by: actorId ?? null },
    { timeZone },
  );
}

export async function deleteWeddingTimelineItem(
  input: WeddingTimelineItemIdInput,
): Promise<void> {
  const values = weddingTimelineItemIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingTimelineItemById(
    values.itemId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }
  await deleteWeddingTimelineItemById(before.id);
}

export async function reorderWeddingTimelineItems(
  input: ReorderWeddingTimelineInput,
): Promise<WeddingTimelineItem[]> {
  const values = reorderWeddingTimelineSchema.parse(input);
  const { timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );

  await applyWeddingTimelineSortOrders(
    values.orderedIds.map((id, index) => ({ id, sort_order: index })),
  );

  return findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
    { timeZone },
  );
}

export async function moveWeddingTimelineItem(
  input: WeddingTimelineItemIdInput & { direction: "up" | "down" },
): Promise<WeddingTimelineItem[]> {
  const values = weddingTimelineItemIdSchema.parse(input);
  const items = await listWeddingTimelineItems({
    workspaceId: values.workspaceId,
    companyId: values.companyId,
    projectId: values.projectId,
  });
  const index = items.findIndex((row) => row.id === values.itemId);
  if (index < 0) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }
  const target = input.direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= items.length) return items;

  const ordered = [...items];
  const [removed] = ordered.splice(index, 1);
  ordered.splice(target, 0, removed!);

  return reorderWeddingTimelineItems({
    workspaceId: values.workspaceId,
    companyId: values.companyId,
    projectId: values.projectId,
    orderedIds: ordered.map((row) => row.id),
  });
}

/**
 * Change an item's start time using Project 101 scheduled_start SoT.
 * Compat input remains HH:MM (clock preserved / shifted).
 */
export async function shiftWeddingTimelineItem(
  input: ShiftWeddingTimelineInput,
  actorId?: string,
): Promise<WeddingTimelineItem[]> {
  const values = shiftWeddingTimelineSchema.parse(input);
  const { project, timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );

  const items = await findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
    { timeZone },
  );
  const index = items.findIndex((row) => row.id === values.itemId);
  if (index < 0) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }

  const item = items[index]!;
  const oldStartMinutes = timeToMinutes(
    item.start_time ?? clockTimeFromInstant(item.scheduled_start, timeZone),
  );
  const newStartMinutes = timeToMinutes(values.newStartTime);
  if (newStartMinutes == null) {
    throw new CoreError(
      "WEDDING_TIMELINE_INVALID_TIME",
      "Invalid start time.",
    );
  }
  const delta =
    oldStartMinutes == null ? 0 : newStartMinutes - oldStartMinutes;

  const resolveStartIso = (
    row: WeddingTimelineItem,
    clock: string,
  ): string | null => {
    if (row.scheduled_start) {
      const currentClock = clockTimeFromInstant(row.scheduled_start, timeZone);
      const currentMins = timeToMinutes(currentClock);
      const targetMins = timeToMinutes(clock);
      if (currentMins == null || targetMins == null) return row.scheduled_start;
      return addMinutesToIso(row.scheduled_start, targetMins - currentMins);
    }
    return instantFromLocalDateAndTime(
      project.wedding_date,
      clock,
      timeZone,
    );
  };

  if (values.mode === "item_only") {
    const scheduledStart = resolveStartIso(item, values.newStartTime);
    await updateWeddingTimelineItemById(
      item.id,
      {
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEndFromStartAndDuration(
          scheduledStart,
          item.duration_minutes,
        ),
        updated_by: actorId ?? null,
      },
      { timeZone },
    );
  } else {
    for (let i = index; i < items.length; i += 1) {
      const row = items[i]!;
      if (i === index) {
        const scheduledStart = resolveStartIso(row, values.newStartTime);
        await updateWeddingTimelineItemById(
          row.id,
          {
            scheduled_start: scheduledStart,
            scheduled_end: scheduledEndFromStartAndDuration(
              scheduledStart,
              row.duration_minutes,
            ),
            updated_by: actorId ?? null,
          },
          { timeZone },
        );
      } else if (delta !== 0 && row.scheduled_start) {
        const scheduledStart = addMinutesToIso(row.scheduled_start, delta);
        await updateWeddingTimelineItemById(
          row.id,
          {
            scheduled_start: scheduledStart,
            scheduled_end: scheduledEndFromStartAndDuration(
              scheduledStart,
              row.duration_minutes,
            ),
            updated_by: actorId ?? null,
          },
          { timeZone },
        );
      }
    }
  }

  return findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
    { timeZone },
  );
}

export async function bulkUpdateWeddingTimelineItems(
  input: BulkWeddingTimelineInput,
  actorId?: string,
): Promise<void> {
  const values = bulkWeddingTimelineSchema.parse(input);
  const { timeZone } = await assertScope(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );

  for (const itemId of values.itemIds) {
    const item = await findWeddingTimelineItemById(
      itemId,
      values.workspaceId,
      { timeZone },
    );
    if (!item || item.project_id !== values.projectId) continue;

    switch (values.action) {
      case "archive":
        await updateWeddingTimelineItemById(
          item.id,
          {
            archived_at: new Date().toISOString(),
            updated_by: actorId ?? null,
          },
          { timeZone },
        );
        break;
      case "restore":
        await updateWeddingTimelineItemById(
          item.id,
          { archived_at: null, updated_by: actorId ?? null },
          { timeZone },
        );
        break;
      case "delete":
        await deleteWeddingTimelineItemById(item.id);
        break;
      case "status":
        if (values.status) {
          await updateWeddingTimelineItemById(
            item.id,
            { status: values.status, updated_by: actorId ?? null },
            { timeZone },
          );
        }
        break;
      case "priority":
        if (values.priority) {
          await updateWeddingTimelineItemById(
            item.id,
            { priority: values.priority, updated_by: actorId ?? null },
            { timeZone },
          );
        }
        break;
      case "reminder":
        await updateWeddingTimelineItemById(
          item.id,
          {
            reminder_minutes: values.reminderMinutes ?? null,
            updated_by: actorId ?? null,
          },
          { timeZone },
        );
        break;
      default:
        break;
    }
  }
}
