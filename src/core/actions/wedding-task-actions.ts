"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import {
  addWeddingTaskAttachment,
  addWeddingTaskComment,
  archiveWeddingProjectTask,
  bulkUpdateWeddingProjectTasks,
  completeWeddingProjectTask,
  createWeddingProjectTask,
  deleteWeddingProjectTask,
  duplicateWeddingProjectTask,
  listWeddingProjectTasks,
  reorderWeddingProjectTasks,
  restoreWeddingProjectTask,
  updateWeddingProjectTask,
} from "@/core/wedding-task/service";
import type {
  AddWeddingTaskAttachmentInput,
  AddWeddingTaskCommentInput,
  BulkWeddingTasksInput,
  CreateWeddingTaskInput,
  ReorderWeddingTasksInput,
  UpdateWeddingTaskInput,
  WeddingTaskIdInput,
} from "@/core/wedding-task/schema";
import type { WeddingProjectTask } from "@/core/wedding-task/types";

export type WeddingTaskActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateTasks(projectId: string) {
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`, "page");
}

async function requireTaskWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "task.write",
  );
}

export async function loadWeddingTasksAction(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<WeddingTaskActionResult<{ tasks: WeddingProjectTask[] }>> {
  try {
    const userId = await requireSessionUserId();
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "task.read",
    );
    const tasks = await listWeddingProjectTasks(input);
    return { ok: true, data: { tasks } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load tasks"),
    };
  }
}

export async function createWeddingTaskAction(
  input: CreateWeddingTaskInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await createWeddingProjectTask(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create task"),
    };
  }
}

export async function updateWeddingTaskAction(
  input: UpdateWeddingTaskInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await updateWeddingProjectTask(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update task"),
    };
  }
}

export async function completeWeddingTaskAction(
  input: WeddingTaskIdInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await completeWeddingProjectTask(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to complete task"),
    };
  }
}

export async function duplicateWeddingTaskAction(
  input: WeddingTaskIdInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await duplicateWeddingProjectTask(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to duplicate task"),
    };
  }
}

export async function archiveWeddingTaskAction(
  input: WeddingTaskIdInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await archiveWeddingProjectTask(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive task"),
    };
  }
}

export async function restoreWeddingTaskAction(
  input: WeddingTaskIdInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await restoreWeddingProjectTask(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore task"),
    };
  }
}

export async function deleteWeddingTaskAction(
  input: WeddingTaskIdInput,
): Promise<WeddingTaskActionResult> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    await deleteWeddingProjectTask(input);
    revalidateTasks(input.projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to delete task"),
    };
  }
}

export async function reorderWeddingTasksAction(
  input: ReorderWeddingTasksInput,
): Promise<WeddingTaskActionResult<{ tasks: WeddingProjectTask[] }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const tasks = await reorderWeddingProjectTasks(input);
    revalidateTasks(input.projectId);
    return { ok: true, data: { tasks } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to reorder tasks"),
    };
  }
}

export async function addWeddingTaskCommentAction(
  input: AddWeddingTaskCommentInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await addWeddingTaskComment(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to add comment"),
    };
  }
}

export async function addWeddingTaskAttachmentAction(
  input: AddWeddingTaskAttachmentInput,
): Promise<WeddingTaskActionResult<{ task: WeddingProjectTask }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await addWeddingTaskAttachment(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to add attachment"),
    };
  }
}

export async function bulkWeddingTasksAction(
  input: BulkWeddingTasksInput,
): Promise<WeddingTaskActionResult> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    await bulkUpdateWeddingProjectTasks(input, userId);
    revalidateTasks(input.projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update tasks"),
    };
  }
}
