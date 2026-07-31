import "server-only";

import type {
  CreateTaskActivityInput,
  ListTaskActivitiesQuery,
  TaskActivity,
} from "@/core/task/activity-types";
import {
  createTaskActivity as createTaskActivityRow,
  listTaskActivities as listTaskActivityRows,
} from "@/core/task/activity-repository";
import type { Task } from "@/core/task/types";
import { CoreError } from "@/core/errors";

async function recordActivity(input: CreateTaskActivityInput): Promise<void> {
  try {
    await createTaskActivityRow(input);
  } catch (error) {
    // Activity must not fail the primary task mutation.
    console.error("recordTaskActivity failed", error);
  }
}

export async function listTaskActivities(
  query: ListTaskActivitiesQuery,
): Promise<TaskActivity[]> {
  try {
    return await listTaskActivityRows(query);
  } catch (error) {
    console.error("listTaskActivities failed", error);
    throw new CoreError(
      "TASK_ACTIVITY_LIST_FAILED",
      "Failed to list task activities.",
    );
  }
}

export async function recordTaskCreatedActivity(
  task: Task,
  actorId: string,
): Promise<void> {
  await recordActivity({
    taskId: task.id,
    workspaceId: task.workspaceId,
    companyId: task.companyId,
    actorId,
    activityType: "task_created",
    message: `Created task "${task.title}"`,
    metadata: { title: task.title },
  });
}

export async function recordTaskDeletedActivity(
  task: Task,
  actorId: string,
): Promise<void> {
  await recordActivity({
    taskId: task.id,
    workspaceId: task.workspaceId,
    companyId: task.companyId,
    actorId,
    activityType: "task_deleted",
    message: `Deleted task "${task.title}"`,
    metadata: { title: task.title },
  });
}

export async function recordTaskUpdateActivities(input: {
  before: Task;
  after: Task;
  actorId: string;
  touched: {
    title?: boolean;
    description?: boolean;
    status?: boolean;
    priority?: boolean;
    dueDate?: boolean;
    ownerId?: boolean;
    assigneeId?: boolean;
    related?: boolean;
  };
}): Promise<void> {
  const { before, after, actorId, touched } = input;
  const base = {
    taskId: after.id,
    workspaceId: after.workspaceId,
    companyId: after.companyId,
    actorId,
  };

  if (touched.status && before.status !== after.status) {
    await recordActivity({
      ...base,
      activityType: "status_changed",
      message: `Changed status on "${after.title}" from ${before.status} to ${after.status}`,
      metadata: {
        title: after.title,
        from: before.status,
        to: after.status,
      },
    });
  }

  if (touched.priority && before.priority !== after.priority) {
    await recordActivity({
      ...base,
      activityType: "priority_changed",
      message: `Changed priority on "${after.title}" from ${before.priority} to ${after.priority}`,
      metadata: {
        title: after.title,
        from: before.priority,
        to: after.priority,
      },
    });
  }

  if (touched.dueDate && before.dueDate !== after.dueDate) {
    await recordActivity({
      ...base,
      activityType: "due_date_changed",
      message: `Changed due date on "${after.title}"`,
      metadata: {
        title: after.title,
        from: before.dueDate,
        to: after.dueDate,
      },
    });
  }

  if (touched.assigneeId && before.assigneeId !== after.assigneeId) {
    await recordActivity({
      ...base,
      activityType: "assignee_changed",
      message: after.assigneeId
        ? `Changed assignee on "${after.title}"`
        : `Removed assignee on "${after.title}"`,
      metadata: {
        title: after.title,
        from: before.assigneeId,
        to: after.assigneeId,
      },
    });
  }

  if (touched.ownerId && before.ownerId !== after.ownerId) {
    await recordActivity({
      ...base,
      activityType: "owner_changed",
      message: after.ownerId
        ? `Changed owner on "${after.title}"`
        : `Removed owner on "${after.title}"`,
      metadata: {
        title: after.title,
        from: before.ownerId,
        to: after.ownerId,
      },
    });
  }

  const otherChanged =
    (touched.title && before.title !== after.title) ||
    (touched.description && before.description !== after.description) ||
    touched.related;

  if (otherChanged) {
    await recordActivity({
      ...base,
      activityType: "task_updated",
      message: `Updated task "${after.title}"`,
      metadata: { title: after.title },
    });
  }
}

export async function recordAssignmentActivity(input: {
  before: Task;
  after: Task;
  actorId: string;
  role: "owner" | "assignee";
}): Promise<void> {
  const { before, after, actorId, role } = input;
  if (role === "assignee") {
    await recordActivity({
      taskId: after.id,
      workspaceId: after.workspaceId,
      companyId: after.companyId,
      actorId,
      activityType: "assignee_changed",
      message: after.assigneeId
        ? `Changed assignee on "${after.title}"`
        : `Removed assignee on "${after.title}"`,
      metadata: {
        title: after.title,
        from: before.assigneeId,
        to: after.assigneeId,
      },
    });
    return;
  }

  await recordActivity({
    taskId: after.id,
    workspaceId: after.workspaceId,
    companyId: after.companyId,
    actorId,
    activityType: "owner_changed",
    message: after.ownerId
      ? `Changed owner on "${after.title}"`
      : `Removed owner on "${after.title}"`,
    metadata: {
      title: after.title,
      from: before.ownerId,
      to: after.ownerId,
    },
  });
}
