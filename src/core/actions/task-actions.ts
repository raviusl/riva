"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import {
  archiveTask,
  assignTask,
  completeTask,
  createTask,
  deleteTask,
  restoreTask,
  unassignTask,
  updateTask,
} from "@/core/task/service";
import type {
  AssignTaskInput,
  CreateTaskInput,
  TaskIdInput,
  UnassignTaskInput,
  UpdateTaskInput,
} from "@/core/task/schema";
import type { Task } from "@/core/task/types";

export type TaskActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateTaskPaths(taskId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/tasks/workspace");
  if (taskId) {
    revalidatePath(`/dashboard/tasks/${taskId}`);
  }
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

async function requireTaskComplete(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "task.complete",
  );
}

async function requireTaskAssign(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "task.assign",
  );
}

export async function createTaskAction(
  input: Omit<CreateTaskInput, "createdBy">,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await createTask({
      ...input,
      createdBy: userId,
      ownerId: input.ownerId ?? userId,
    });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create task"),
    };
  }
}

export async function updateTaskAction(
  input: Omit<UpdateTaskInput, "actorId">,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await updateTask({
      ...input,
      actorId: userId,
    });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update task"),
    };
  }
}

export async function completeTaskAction(
  input: TaskIdInput,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskComplete(userId, input.workspaceId, input.companyId);
    const task = await completeTask({ ...input, actorId: userId });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to complete task"),
    };
  }
}

export async function archiveTaskAction(
  input: TaskIdInput,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await archiveTask({ ...input, actorId: userId });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive task"),
    };
  }
}

export async function restoreTaskAction(
  input: TaskIdInput,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    const task = await restoreTask({ ...input, actorId: userId });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore task"),
    };
  }
}

export async function deleteTaskAction(
  input: TaskIdInput,
): Promise<TaskActionResult<{ taskId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskWrite(userId, input.workspaceId, input.companyId);
    await deleteTask({
      ...input,
      actorId: userId,
    });
    revalidateTaskPaths(input.taskId);
    return { ok: true, data: { taskId: input.taskId } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to delete task"),
    };
  }
}

export async function assignTaskAction(
  input: Omit<AssignTaskInput, "actorId">,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskAssign(userId, input.workspaceId, input.companyId);
    const task = await assignTask({
      ...input,
      actorId: userId,
    });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to assign task"),
    };
  }
}

export async function unassignTaskAction(
  input: Omit<UnassignTaskInput, "actorId">,
): Promise<TaskActionResult<{ task: Task }>> {
  try {
    const userId = await requireSessionUserId();
    await requireTaskAssign(userId, input.workspaceId, input.companyId);
    const task = await unassignTask({
      ...input,
      actorId: userId,
    });
    revalidateTaskPaths(task.id);
    return { ok: true, data: { task } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to unassign task"),
    };
  }
}
