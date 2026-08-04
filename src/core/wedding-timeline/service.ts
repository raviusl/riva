import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  bulkWeddingTimelineSchema,
  createWeddingTimelineItemSchema,
  reorderWeddingTimelineSchema,
  shiftWeddingTimelineSchema,
  updateWeddingTimelineItemSchema,
  weddingTimelineItemIdSchema,
  type BulkWeddingTimelineInput,
  type CreateWeddingTimelineItemInput,
  type ReorderWeddingTimelineInput,
  type ShiftWeddingTimelineInput,
  type UpdateWeddingTimelineItemInput,
  type WeddingTimelineItemIdInput,
} from "@/core/wedding-timeline/schema";
import {
  applyWeddingTimelineSequences,
  deleteWeddingTimelineItemById,
  findWeddingTimelineItemById,
  findWeddingTimelineItemsByProject,
  insertWeddingTimelineItem,
  updateWeddingTimelineItemById,
} from "@/core/wedding-timeline/repository";
import type { WeddingTimelineItem } from "@/core/wedding-timeline/types";
import {
  normalizeTime,
  shiftTime,
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
  await getWorkspaceById(workspaceId);
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
  return project;
}

export async function listWeddingTimelineItems(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<WeddingTimelineItem[]> {
  await assertScope(input.workspaceId, input.companyId, input.projectId);
  try {
    return await findWeddingTimelineItemsByProject(
      input.workspaceId,
      input.companyId,
      input.projectId,
      { includeArchived: input.includeArchived },
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
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  const existing = await findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
    { includeArchived: true },
  );
  const nextSequence =
    values.sequence ??
    (existing.length === 0
      ? 0
      : Math.max(...existing.map((row) => row.sequence)) + 1);

  try {
    return await insertWeddingTimelineItem({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      project_id: values.projectId,
      sequence: nextSequence,
      start_time: normalizeTime(values.startTime),
      end_time: normalizeTime(values.endTime),
      title: values.title.trim(),
      description: trimOrNull(values.description),
      category: trimOrNull(
        typeof values.category === "string" ? values.category : null,
      ),
      location: trimOrNull(values.location),
      status: values.status ?? "not_started",
      priority: values.priority ?? "normal",
      reminder_minutes: values.reminderMinutes ?? null,
      pic_label: trimOrNull(values.picLabel),
      vendor_id: values.vendorId ?? null,
      coordinator_label: trimOrNull(values.coordinatorLabel),
      crew: trimOrNull(values.crew),
      assignments: values.assignments ?? [],
      checklist: values.checklist ?? [],
      attachments: values.attachments ?? [],
      internal_notes: trimOrNull(values.internalNotes),
      depends_on_id: values.dependsOnId ?? null,
      created_by: actorId ?? null,
    });
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
): Promise<WeddingTimelineItem> {
  const values = updateWeddingTimelineItemSchema.parse(input);
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

  try {
    return await updateWeddingTimelineItemById(before.id, {
      title: values.title.trim(),
      description: trimOrNull(values.description),
      start_time: normalizeTime(values.startTime),
      end_time: normalizeTime(values.endTime),
      category: trimOrNull(
        typeof values.category === "string" ? values.category : null,
      ),
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
      assignments: values.assignments ?? before.assignments,
      checklist: values.checklist ?? before.checklist,
      attachments: values.attachments ?? before.attachments,
      internal_notes: trimOrNull(values.internalNotes),
      depends_on_id: values.dependsOnId ?? null,
    });
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
  const source = await findWeddingTimelineItemById(
    values.itemId,
    values.workspaceId,
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
      startTime: source.start_time,
      endTime: source.end_time,
      category: source.category,
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
      sequence: source.sequence + 1,
    },
    actorId,
  );
}

export async function archiveWeddingTimelineItem(
  input: WeddingTimelineItemIdInput,
): Promise<WeddingTimelineItem> {
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
  if (before.archived_at) return before;
  return updateWeddingTimelineItemById(before.id, {
    archived_at: new Date().toISOString(),
  });
}

export async function restoreWeddingTimelineItem(
  input: WeddingTimelineItemIdInput,
): Promise<WeddingTimelineItem> {
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
  return updateWeddingTimelineItemById(before.id, { archived_at: null });
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
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  await applyWeddingTimelineSequences(
    values.orderedIds.map((id, index) => ({ id, sequence: index })),
  );

  return findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
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
 * Change an item's start time.
 * mode=item_only — only this item (preserve duration if end set)
 * mode=shift_following — shift this item and all later items by the delta
 */
export async function shiftWeddingTimelineItem(
  input: ShiftWeddingTimelineInput,
): Promise<WeddingTimelineItem[]> {
  const values = shiftWeddingTimelineSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  const items = await findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
  const index = items.findIndex((row) => row.id === values.itemId);
  if (index < 0) {
    throw new CoreError(
      "WEDDING_TIMELINE_NOT_FOUND",
      "Timeline item not found.",
    );
  }

  const item = items[index]!;
  const oldStart = timeToMinutes(item.start_time);
  const newStart = timeToMinutes(values.newStartTime);
  if (newStart == null) {
    throw new CoreError(
      "WEDDING_TIMELINE_INVALID_TIME",
      "Invalid start time.",
    );
  }
  const delta = oldStart == null ? 0 : newStart - oldStart;
  const duration =
    oldStart != null && timeToMinutes(item.end_time) != null
      ? timeToMinutes(item.end_time)! - oldStart
      : null;

  if (values.mode === "item_only") {
    await updateWeddingTimelineItemById(item.id, {
      start_time: normalizeTime(values.newStartTime),
      end_time:
        duration != null
          ? shiftTime(values.newStartTime, duration)
          : item.end_time,
    });
  } else {
    for (let i = index; i < items.length; i += 1) {
      const row = items[i]!;
      const rowDelta = i === index ? delta : delta;
      if (i === index) {
        await updateWeddingTimelineItemById(row.id, {
          start_time: normalizeTime(values.newStartTime),
          end_time:
            duration != null
              ? shiftTime(values.newStartTime, duration)
              : shiftTime(row.end_time, rowDelta),
        });
      } else if (rowDelta !== 0) {
        await updateWeddingTimelineItemById(row.id, {
          start_time: shiftTime(row.start_time, rowDelta),
          end_time: shiftTime(row.end_time, rowDelta),
        });
      }
    }
  }

  return findWeddingTimelineItemsByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
}

export async function bulkUpdateWeddingTimelineItems(
  input: BulkWeddingTimelineInput,
): Promise<void> {
  const values = bulkWeddingTimelineSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  for (const itemId of values.itemIds) {
    const item = await findWeddingTimelineItemById(
      itemId,
      values.workspaceId,
    );
    if (!item || item.project_id !== values.projectId) continue;

    switch (values.action) {
      case "archive":
        await updateWeddingTimelineItemById(item.id, {
          archived_at: new Date().toISOString(),
        });
        break;
      case "restore":
        await updateWeddingTimelineItemById(item.id, { archived_at: null });
        break;
      case "delete":
        await deleteWeddingTimelineItemById(item.id);
        break;
      case "status":
        if (values.status) {
          await updateWeddingTimelineItemById(item.id, {
            status: values.status,
          });
        }
        break;
      case "priority":
        if (values.priority) {
          await updateWeddingTimelineItemById(item.id, {
            priority: values.priority,
          });
        }
        break;
      case "reminder":
        await updateWeddingTimelineItemById(item.id, {
          reminder_minutes: values.reminderMinutes ?? null,
        });
        break;
      default:
        break;
    }
  }
}
