import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  addWeddingTaskAttachmentSchema,
  addWeddingTaskCommentSchema,
  bulkWeddingTasksSchema,
  createWeddingTaskSchema,
  reorderWeddingTasksSchema,
  updateWeddingTaskSchema,
  weddingTaskIdSchema,
  type AddWeddingTaskAttachmentInput,
  type AddWeddingTaskCommentInput,
  type BulkWeddingTasksInput,
  type CreateWeddingTaskInput,
  type ReorderWeddingTasksInput,
  type UpdateWeddingTaskInput,
  type WeddingTaskIdInput,
} from "@/core/wedding-task/schema";
import {
  applyWeddingTaskSequences,
  deleteWeddingProjectTaskById,
  findWeddingProjectTaskById,
  findWeddingProjectTasksByProject,
  insertWeddingProjectTask,
  updateWeddingProjectTaskById,
} from "@/core/wedding-task/repository";
import type {
  WeddingTaskActivity,
  WeddingProjectTask,
} from "@/core/wedding-task/types";
import { getWorkspaceById } from "@/core/workspace/workspace";

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function activityEntry(
  action: string,
  message: string,
  actorId?: string | null,
): WeddingTaskActivity {
  return {
    id: crypto.randomUUID(),
    action,
    message,
    createdAt: new Date().toISOString(),
    actorId: actorId ?? null,
    actorLabel: null,
  };
}

function appendActivity(
  existing: WeddingTaskActivity[],
  entry: WeddingTaskActivity,
  limit = 80,
): WeddingTaskActivity[] {
  return [entry, ...existing].slice(0, limit);
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

export async function listWeddingProjectTasks(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<WeddingProjectTask[]> {
  await assertScope(input.workspaceId, input.companyId, input.projectId);
  try {
    return await findWeddingProjectTasksByProject(
      input.workspaceId,
      input.companyId,
      input.projectId,
      { includeArchived: input.includeArchived },
    );
  } catch (error) {
    console.error("listWeddingProjectTasks failed", error);
    throw new CoreError(
      "WEDDING_TASK_LIST_FAILED",
      "Failed to load wedding tasks.",
    );
  }
}

export async function createWeddingProjectTask(
  input: CreateWeddingTaskInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = createWeddingTaskSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  const existing = await findWeddingProjectTasksByProject(
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

  const status = values.status ?? "todo";
  const completedAt =
    status === "completed" ? new Date().toISOString() : null;

  try {
    return await insertWeddingProjectTask({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      project_id: values.projectId,
      sequence: nextSequence,
      title: values.title.trim(),
      description: trimOrNull(values.description),
      status,
      priority: values.priority ?? "normal",
      due_date: values.dueDate ?? null,
      start_date: values.startDate ?? null,
      completed_at: completedAt,
      reminder_minutes: values.reminderMinutes ?? null,
      assignee_label: trimOrNull(values.assigneeLabel),
      assignee_person_id: values.assigneePersonId ?? null,
      client_id: values.clientId ?? null,
      vendor_id: values.vendorId ?? null,
      coordinator_label: trimOrNull(values.coordinatorLabel),
      package_label: trimOrNull(values.packageLabel),
      tags: values.tags ?? [],
      attachments: values.attachments ?? [],
      comments: values.comments ?? [],
      activity_log: [
        activityEntry("created", "Task created", actorId),
      ],
      internal_notes: trimOrNull(values.internalNotes),
      created_by: actorId ?? null,
    });
  } catch (error) {
    console.error("createWeddingProjectTask failed", error);
    throw new CoreError(
      "WEDDING_TASK_CREATE_FAILED",
      "Failed to create wedding task.",
    );
  }
}

export async function updateWeddingProjectTask(
  input: UpdateWeddingTaskInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = updateWeddingTaskSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }

  const nextStatus = values.status ?? before.status;
  let completedAt = before.completed_at;
  if (nextStatus === "completed" && before.status !== "completed") {
    completedAt = new Date().toISOString();
  } else if (nextStatus !== "completed") {
    completedAt = null;
  }

  const activity = appendActivity(
    before.activity_log,
    activityEntry("updated", "Task updated", actorId),
  );

  try {
    return await updateWeddingProjectTaskById(before.id, {
      title: values.title.trim(),
      description: trimOrNull(values.description),
      status: nextStatus,
      priority: values.priority ?? before.priority,
      due_date: values.dueDate !== undefined ? values.dueDate : before.due_date,
      start_date:
        values.startDate !== undefined ? values.startDate : before.start_date,
      completed_at: completedAt,
      reminder_minutes:
        values.reminderMinutes !== undefined
          ? values.reminderMinutes
          : before.reminder_minutes,
      assignee_label: trimOrNull(values.assigneeLabel),
      assignee_person_id: values.assigneePersonId ?? null,
      client_id: values.clientId ?? null,
      vendor_id: values.vendorId ?? null,
      coordinator_label: trimOrNull(values.coordinatorLabel),
      package_label: trimOrNull(values.packageLabel),
      tags: values.tags ?? before.tags,
      attachments: values.attachments ?? before.attachments,
      comments: values.comments ?? before.comments,
      activity_log: activity,
      internal_notes: trimOrNull(values.internalNotes),
    });
  } catch (error) {
    console.error("updateWeddingProjectTask failed", error);
    throw new CoreError(
      "WEDDING_TASK_UPDATE_FAILED",
      "Failed to update wedding task.",
    );
  }
}

export async function completeWeddingProjectTask(
  input: WeddingTaskIdInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = weddingTaskIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }
  if (before.status === "completed") return before;

  return updateWeddingProjectTaskById(before.id, {
    status: "completed",
    completed_at: new Date().toISOString(),
    activity_log: appendActivity(
      before.activity_log,
      activityEntry("completed", "Task completed", actorId),
    ),
  });
}

export async function duplicateWeddingProjectTask(
  input: WeddingTaskIdInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = weddingTaskIdSchema.parse(input);
  const source = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!source || source.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }

  return createWeddingProjectTask(
    {
      workspaceId: values.workspaceId,
      companyId: values.companyId,
      projectId: values.projectId,
      title: `${source.title} (copy)`,
      description: source.description,
      status: "todo",
      priority: source.priority,
      dueDate: source.due_date,
      startDate: source.start_date,
      reminderMinutes: source.reminder_minutes,
      assigneeLabel: source.assignee_label,
      assigneePersonId: source.assignee_person_id,
      clientId: source.client_id,
      vendorId: source.vendor_id,
      coordinatorLabel: source.coordinator_label,
      packageLabel: source.package_label,
      tags: source.tags,
      attachments: [],
      comments: [],
      internalNotes: source.internal_notes,
      sequence: source.sequence + 1,
    },
    actorId,
  );
}

export async function archiveWeddingProjectTask(
  input: WeddingTaskIdInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = weddingTaskIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }
  if (before.archived_at) return before;
  return updateWeddingProjectTaskById(before.id, {
    archived_at: new Date().toISOString(),
    activity_log: appendActivity(
      before.activity_log,
      activityEntry("archived", "Task archived", actorId),
    ),
  });
}

export async function restoreWeddingProjectTask(
  input: WeddingTaskIdInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = weddingTaskIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }
  return updateWeddingProjectTaskById(before.id, {
    archived_at: null,
    activity_log: appendActivity(
      before.activity_log,
      activityEntry("restored", "Task restored", actorId),
    ),
  });
}

export async function deleteWeddingProjectTask(
  input: WeddingTaskIdInput,
): Promise<void> {
  const values = weddingTaskIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }
  await deleteWeddingProjectTaskById(before.id);
}

export async function reorderWeddingProjectTasks(
  input: ReorderWeddingTasksInput,
): Promise<WeddingProjectTask[]> {
  const values = reorderWeddingTasksSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  await applyWeddingTaskSequences(
    values.orderedIds.map((id, index) => ({ id, sequence: index })),
  );

  return findWeddingProjectTasksByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
  );
}

export async function addWeddingTaskComment(
  input: AddWeddingTaskCommentInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = addWeddingTaskCommentSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }

  const comment = {
    id: crypto.randomUUID(),
    body: values.body.trim(),
    authorLabel: values.authorLabel?.trim() || "Planner",
    authorId: actorId ?? null,
    createdAt: new Date().toISOString(),
  };

  return updateWeddingProjectTaskById(before.id, {
    comments: [comment, ...before.comments],
    activity_log: appendActivity(
      before.activity_log,
      activityEntry("comment", "Comment added", actorId),
    ),
  });
}

export async function addWeddingTaskAttachment(
  input: AddWeddingTaskAttachmentInput,
  actorId?: string,
): Promise<WeddingProjectTask> {
  const values = addWeddingTaskAttachmentSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingProjectTaskById(
    values.taskId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_TASK_NOT_FOUND", "Task not found.");
  }

  const attachment = {
    id: crypto.randomUUID(),
    name: values.name.trim(),
    url: values.url ?? null,
    mimeType: values.mimeType ?? null,
  };

  return updateWeddingProjectTaskById(before.id, {
    attachments: [attachment, ...before.attachments],
    activity_log: appendActivity(
      before.activity_log,
      activityEntry("attachment", `Attachment added: ${attachment.name}`, actorId),
    ),
  });
}

export async function bulkUpdateWeddingProjectTasks(
  input: BulkWeddingTasksInput,
  actorId?: string,
): Promise<void> {
  const values = bulkWeddingTasksSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  for (const taskId of values.taskIds) {
    const task = await findWeddingProjectTaskById(taskId, values.workspaceId);
    if (!task || task.project_id !== values.projectId) continue;

    switch (values.action) {
      case "archive":
        await updateWeddingProjectTaskById(task.id, {
          archived_at: new Date().toISOString(),
          activity_log: appendActivity(
            task.activity_log,
            activityEntry("archived", "Task archived", actorId),
          ),
        });
        break;
      case "restore":
        await updateWeddingProjectTaskById(task.id, {
          archived_at: null,
          activity_log: appendActivity(
            task.activity_log,
            activityEntry("restored", "Task restored", actorId),
          ),
        });
        break;
      case "delete":
        await deleteWeddingProjectTaskById(task.id);
        break;
      case "status":
        if (values.status) {
          await updateWeddingProjectTaskById(task.id, {
            status: values.status,
            completed_at:
              values.status === "completed"
                ? new Date().toISOString()
                : null,
            activity_log: appendActivity(
              task.activity_log,
              activityEntry("status", `Status → ${values.status}`, actorId),
            ),
          });
        }
        break;
      case "priority":
        if (values.priority) {
          await updateWeddingProjectTaskById(task.id, {
            priority: values.priority,
            activity_log: appendActivity(
              task.activity_log,
              activityEntry(
                "priority",
                `Priority → ${values.priority}`,
                actorId,
              ),
            ),
          });
        }
        break;
      case "complete":
        await updateWeddingProjectTaskById(task.id, {
          status: "completed",
          completed_at: new Date().toISOString(),
          activity_log: appendActivity(
            task.activity_log,
            activityEntry("completed", "Task completed", actorId),
          ),
        });
        break;
      case "reminder":
        await updateWeddingProjectTaskById(task.id, {
          reminder_minutes: values.reminderMinutes ?? null,
          activity_log: appendActivity(
            task.activity_log,
            activityEntry("reminder", "Reminder updated", actorId),
          ),
        });
        break;
      default:
        break;
    }
  }
}
