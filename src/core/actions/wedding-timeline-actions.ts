"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
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

async function requireTimelineWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "timeline.write",
  );
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
    const item = await updateWeddingTimelineItem(input);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
    const item = await archiveWeddingTimelineItem(input);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
    const item = await restoreWeddingTimelineItem(input);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
    const items = await shiftWeddingTimelineItem(input);
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
    await requireTimelineWrite(userId, input.workspaceId, input.companyId);
    await bulkUpdateWeddingTimelineItems(input);
    revalidateTimeline(input.projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update timeline items"),
    };
  }
}
