"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import {
  archiveWeddingTimelineItem,
  bulkUpdateWeddingTimelineItems,
  createWeddingTimelineItem,
  deleteWeddingTimelineItem,
  duplicateWeddingTimelineItem,
  listWeddingTimelineItems,
  moveWeddingTimelineItem,
  reorderWeddingTimelineItems,
  restoreWeddingTimelineItem,
  shiftWeddingTimelineItem,
  updateWeddingTimelineItem,
} from "@/core/wedding-timeline/service";
import {
  WEDDING_TIMELINE_ARCHIVE_PERMISSION,
  WEDDING_TIMELINE_EXECUTE_PERMISSION,
  WEDDING_TIMELINE_RESTORE_PERMISSION,
  WEDDING_TIMELINE_STRUCTURE_PERMISSION,
} from "@/core/wedding-timeline/permissions";
import type {
  BulkWeddingTimelineInput,
  CreateWeddingTimelineItemInput,
  ReorderWeddingTimelineInput,
  ShiftWeddingTimelineInput,
  UpdateWeddingTimelineItemInput,
  WeddingTimelineItemIdInput,
} from "@/core/wedding-timeline/schema";
import type { WeddingTimelineItem } from "@/core/wedding-timeline/types";

export type WeddingTimelineActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateTimeline(projectId: string) {
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`, "page");
}

async function requireTimelineStructure(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    WEDDING_TIMELINE_STRUCTURE_PERMISSION,
  );
}

async function requireTimelineExecute(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    WEDDING_TIMELINE_EXECUTE_PERMISSION,
  );
}

async function requireTimelineArchive(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    WEDDING_TIMELINE_ARCHIVE_PERMISSION,
  );
}

async function requireTimelineRestore(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    WEDDING_TIMELINE_RESTORE_PERMISSION,
  );
}

/**
 * Updates may be structure (fields/times) or execute (status/checklist/actuals).
 * Require structure OR execute; finer state policy lands in M2+.
 */
async function requireTimelineStructureOrExecute(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  try {
    await requireTimelineStructure(userId, workspaceId, companyId);
    return;
  } catch (error) {
    if (
      !(error instanceof CoreError) ||
      error.code !== "PERMISSION_DENIED"
    ) {
      throw error;
    }
  }
  await requireTimelineExecute(userId, workspaceId, companyId);
}

export async function loadWeddingTimelineAction(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<WeddingTimelineActionResult<{ items: WeddingTimelineItem[] }>> {
  try {
    const userId = await requireSessionUserId();
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "timeline.read",
    );
    const items = await listWeddingTimelineItems(input);
    return { ok: true, data: { items } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load timeline"),
    };
  }
}

export async function createWeddingTimelineItemAction(
  input: CreateWeddingTimelineItemInput,
): Promise<WeddingTimelineActionResult<{ item: WeddingTimelineItem }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineStructure(userId, input.workspaceId, input.companyId);
    const item = await createWeddingTimelineItem(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { item } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create timeline item"),
    };
  }
}

export async function updateWeddingTimelineItemAction(
  input: UpdateWeddingTimelineItemInput,
): Promise<WeddingTimelineActionResult<{ item: WeddingTimelineItem }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineStructureOrExecute(
      userId,
      input.workspaceId,
      input.companyId,
    );
    const item = await updateWeddingTimelineItem(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { item } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update timeline item"),
    };
  }
}

export async function duplicateWeddingTimelineItemAction(
  input: WeddingTimelineItemIdInput,
): Promise<WeddingTimelineActionResult<{ item: WeddingTimelineItem }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineStructure(userId, input.workspaceId, input.companyId);
    const item = await duplicateWeddingTimelineItem(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { item } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to duplicate timeline item"),
    };
  }
}

export async function archiveWeddingTimelineItemAction(
  input: WeddingTimelineItemIdInput,
): Promise<WeddingTimelineActionResult<{ item: WeddingTimelineItem }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineArchive(userId, input.workspaceId, input.companyId);
    const item = await archiveWeddingTimelineItem(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { item } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive timeline item"),
    };
  }
}

export async function restoreWeddingTimelineItemAction(
  input: WeddingTimelineItemIdInput,
): Promise<WeddingTimelineActionResult<{ item: WeddingTimelineItem }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineRestore(userId, input.workspaceId, input.companyId);
    const item = await restoreWeddingTimelineItem(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { item } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore timeline item"),
    };
  }
}

export async function deleteWeddingTimelineItemAction(
  input: WeddingTimelineItemIdInput,
): Promise<WeddingTimelineActionResult> {
  try {
    const userId = await requireSessionUserId();
    // Hard delete deferred in 101 product sense; still gated as structure.
    await requireTimelineStructure(userId, input.workspaceId, input.companyId);
    await deleteWeddingTimelineItem(input);
    revalidateTimeline(input.projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to delete timeline item"),
    };
  }
}

export async function reorderWeddingTimelineAction(
  input: ReorderWeddingTimelineInput,
): Promise<WeddingTimelineActionResult<{ items: WeddingTimelineItem[] }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineStructure(userId, input.workspaceId, input.companyId);
    const items = await reorderWeddingTimelineItems(input);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { items } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to reorder timeline"),
    };
  }
}

export async function moveWeddingTimelineItemAction(
  input: WeddingTimelineItemIdInput & { direction: "up" | "down" },
): Promise<WeddingTimelineActionResult<{ items: WeddingTimelineItem[] }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineStructure(userId, input.workspaceId, input.companyId);
    const items = await moveWeddingTimelineItem(input);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { items } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to move timeline item"),
    };
  }
}

export async function shiftWeddingTimelineItemAction(
  input: ShiftWeddingTimelineInput,
): Promise<WeddingTimelineActionResult<{ items: WeddingTimelineItem[] }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTimelineStructure(userId, input.workspaceId, input.companyId);
    const items = await shiftWeddingTimelineItem(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: { items } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to shift timeline"),
    };
  }
}

export async function bulkWeddingTimelineAction(
  input: BulkWeddingTimelineInput,
): Promise<WeddingTimelineActionResult> {
  try {
    const userId = await requireSessionUserId();
    switch (input.action) {
      case "archive":
        await requireTimelineArchive(
          userId,
          input.workspaceId,
          input.companyId,
        );
        break;
      case "restore":
        await requireTimelineRestore(
          userId,
          input.workspaceId,
          input.companyId,
        );
        break;
      case "status":
        await requireTimelineExecute(
          userId,
          input.workspaceId,
          input.companyId,
        );
        break;
      default:
        await requireTimelineStructure(
          userId,
          input.workspaceId,
          input.companyId,
        );
        break;
    }
    await bulkUpdateWeddingTimelineItems(input, userId);
    revalidateTimeline(input.projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update timeline items"),
    };
  }
}
