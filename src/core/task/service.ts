import "server-only";

import { getClientById } from "@/core/client/client";
import { getCompanyById } from "@/core/company/company";
import {
  assertCompanyBoundary,
  requireCompany,
} from "@/core/company-isolation";
import { CoreError } from "@/core/errors";
import { getMeetingById } from "@/core/meeting/meeting";
import { getProjectById } from "@/core/project/project";
import {
  listTaskActivities,
  recordAssignmentActivity,
  recordTaskCreatedActivity,
  recordTaskDeletedActivity,
  recordTaskUpdateActivities,
} from "@/core/task/activity";
import { recordTaskAudit } from "@/core/task/audit";
import { EDITABLE_TASK_STATUSES } from "@/core/task/constants";
import {
  assignTaskSchema,
  createTaskSchema,
  deleteTaskSchema,
  listTasksQuerySchema,
  taskIdSchema,
  unassignTaskSchema,
  updateTaskSchema,
  type AssignTaskInput,
  type CreateTaskInput,
  type DeleteTaskInput,
  type ListTasksQuery,
  type TaskIdInput,
  type UnassignTaskInput,
  type UpdateTaskInput,
} from "@/core/task/schema";
import {
  setTaskArchivedAt,
  taskRepository,
  type TaskRepository,
} from "@/core/task/repository";
import type { Task } from "@/core/task/types";
import { getVendorById } from "@/core/vendor/vendor";
import { getWorkspaceById } from "@/core/workspace/workspace";

export type { ListTaskActivitiesQuery } from "@/core/task/activity-types";
export type { TaskActivity } from "@/core/task/activity-types";
export { listTaskActivities };

/**
 * Task domain service contract.
 */
export interface TaskService {
  getTask(input: TaskIdInput): Promise<Task>;
  listTasks(query: ListTasksQuery): Promise<Task[]>;
  listTasksByProject(
    workspaceId: string,
    companyId: string,
    relatedProjectId: string,
  ): Promise<Task[]>;
  listTasksByClient(
    workspaceId: string,
    companyId: string,
    relatedClientId: string,
  ): Promise<Task[]>;
  listTasksByVendor(
    workspaceId: string,
    companyId: string,
    relatedVendorId: string,
  ): Promise<Task[]>;
  listTasksByMeeting(
    workspaceId: string,
    companyId: string,
    relatedMeetingId: string,
  ): Promise<Task[]>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(input: UpdateTaskInput): Promise<Task>;
  completeTask(input: TaskIdInput & { actorId: string }): Promise<Task>;
  archiveTask(input: TaskIdInput & { actorId: string }): Promise<Task>;
  restoreTask(input: TaskIdInput & { actorId: string }): Promise<Task>;
  deleteTask(input: DeleteTaskInput): Promise<void>;
  assignTask(input: AssignTaskInput): Promise<Task>;
  unassignTask(input: UnassignTaskInput): Promise<Task>;
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<string> {
  const scopedCompanyId = requireCompany(companyId);
  await getWorkspaceById(workspaceId);
  const company = await getCompanyById(scopedCompanyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  return scopedCompanyId;
}

async function assertProjectInCompany(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId || project.workspace_id !== workspaceId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
}

async function assertRelatedEntities(
  workspaceId: string,
  companyId: string,
  values: {
    relatedProjectId?: string | null;
    relatedClientId?: string | null;
    relatedVendorId?: string | null;
    relatedMeetingId?: string | null;
  },
): Promise<void> {
  if (values.relatedProjectId) {
    await assertProjectInCompany(
      workspaceId,
      companyId,
      values.relatedProjectId,
    );
  }
  if (values.relatedClientId) {
    await getClientById(values.relatedClientId, workspaceId, companyId);
  }
  if (values.relatedVendorId) {
    await getVendorById(values.relatedVendorId, workspaceId, companyId);
  }
  if (values.relatedMeetingId) {
    await getMeetingById(values.relatedMeetingId, workspaceId, companyId);
  }
}

function assertTaskCompanyScope(task: Task, companyId: string): void {
  assertCompanyBoundary(companyId, task.companyId);
}

function assertEditable(task: Task): void {
  if (task.archivedAt) {
    throw new CoreError(
      "TASK_NOT_EDITABLE",
      "Archived tasks cannot be edited. Restore the task first.",
    );
  }
  if (!EDITABLE_TASK_STATUSES.includes(task.status) && task.status !== "cancelled") {
    throw new CoreError("TASK_NOT_EDITABLE", "Task cannot be edited.");
  }
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function createTaskService(repository: TaskRepository): TaskService {
  return {
    async getTask(input) {
      const values = taskIdSchema.parse(input);
      const companyId = requireCompany(values.companyId);
      try {
        const task = await repository.getTaskById(
          values.taskId,
          values.workspaceId,
        );
        if (!task) {
          throw new CoreError("TASK_NOT_FOUND", "Task not found.");
        }
        assertTaskCompanyScope(task, companyId);
        return task;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("getTask failed", error);
        throw new CoreError("TASK_LOAD_FAILED", "Failed to load task.");
      }
    },

    async listTasks(query) {
      const values = listTasksQuerySchema.parse(query);
      await assertCompanyInWorkspace(values.workspaceId, values.companyId);
      try {
        return await repository.listTasks(values);
      } catch (error) {
        console.error("listTasks failed", error);
        throw new CoreError("TASK_LIST_FAILED", "Failed to list tasks.");
      }
    },

    async listTasksByProject(workspaceId, companyId, relatedProjectId) {
      await assertCompanyInWorkspace(workspaceId, companyId);
      await assertProjectInCompany(workspaceId, companyId, relatedProjectId);
      try {
        return await repository.listTasksByProject(
          workspaceId,
          companyId,
          relatedProjectId,
        );
      } catch (error) {
        console.error("listTasksByProject failed", error);
        throw new CoreError("TASK_LIST_FAILED", "Failed to list tasks.");
      }
    },

    async listTasksByClient(workspaceId, companyId, relatedClientId) {
      await assertCompanyInWorkspace(workspaceId, companyId);
      await getClientById(relatedClientId, workspaceId, companyId);
      try {
        return await repository.listTasksByClient(
          workspaceId,
          companyId,
          relatedClientId,
        );
      } catch (error) {
        console.error("listTasksByClient failed", error);
        throw new CoreError("TASK_LIST_FAILED", "Failed to list tasks.");
      }
    },

    async listTasksByVendor(workspaceId, companyId, relatedVendorId) {
      await assertCompanyInWorkspace(workspaceId, companyId);
      await getVendorById(relatedVendorId, workspaceId, companyId);
      try {
        return await repository.listTasksByVendor(
          workspaceId,
          companyId,
          relatedVendorId,
        );
      } catch (error) {
        console.error("listTasksByVendor failed", error);
        throw new CoreError("TASK_LIST_FAILED", "Failed to list tasks.");
      }
    },

    async listTasksByMeeting(workspaceId, companyId, relatedMeetingId) {
      await assertCompanyInWorkspace(workspaceId, companyId);
      await getMeetingById(relatedMeetingId, workspaceId, companyId);
      try {
        return await repository.listTasksByMeeting(
          workspaceId,
          companyId,
          relatedMeetingId,
        );
      } catch (error) {
        console.error("listTasksByMeeting failed", error);
        throw new CoreError("TASK_LIST_FAILED", "Failed to list tasks.");
      }
    },

    async createTask(input) {
      const values = createTaskSchema.parse(input);
      const companyId = await assertCompanyInWorkspace(
        values.workspaceId,
        values.companyId,
      );
      await assertRelatedEntities(values.workspaceId, companyId, values);

      try {
        const task = await repository.createTask({
          ...values,
          companyId,
          title: values.title.trim(),
          description: values.description?.trim()
            ? values.description.trim()
            : null,
          ownerId: values.ownerId ?? values.createdBy,
          tags: values.tags ?? [],
          followers: values.followers ?? [],
        });
        await recordTaskCreatedActivity(task, values.createdBy);
        recordTaskAudit({
          action: "create",
          actorId: values.createdBy,
          before: null,
          after: task,
        });
        return task;
      } catch (error) {
        console.error("createTask failed", error);
        throw new CoreError("TASK_CREATE_FAILED", "Failed to create task.");
      }
    },

    async updateTask(input) {
      const values = updateTaskSchema.parse(input);
      const companyId = requireCompany(values.companyId);
      const existing = await this.getTask({
        workspaceId: values.workspaceId,
        companyId,
        taskId: values.taskId,
      });
      assertEditable(existing);
      await assertRelatedEntities(values.workspaceId, companyId, values);

      const nextStatus = values.status ?? existing.status;
      const completedDate =
        values.completedDate !== undefined
          ? values.completedDate
          : nextStatus === "completed" && existing.status !== "completed"
            ? todayDateString()
            : nextStatus !== "completed"
              ? null
              : existing.completedDate;

      try {
        const updated = await repository.updateTask({
          ...values,
          title:
            values.title !== undefined ? values.title.trim() : existing.title,
          description:
            values.description !== undefined
              ? values.description?.trim()
                ? values.description.trim()
                : null
              : existing.description,
          completedDate,
          status: nextStatus,
        });

        await recordTaskUpdateActivities({
          before: existing,
          after: updated,
          actorId: values.actorId,
          touched: {
            title: values.title !== undefined,
            description: values.description !== undefined,
            status: values.status !== undefined,
            priority: values.priority !== undefined,
            dueDate: values.dueDate !== undefined,
            ownerId: values.ownerId !== undefined,
            assigneeId: values.assigneeId !== undefined,
            related:
              values.relatedProjectId !== undefined ||
              values.relatedClientId !== undefined ||
              values.relatedVendorId !== undefined ||
              values.relatedMeetingId !== undefined,
          },
        });

        recordTaskAudit({
          action: "update",
          actorId: values.actorId,
          before: existing,
          after: updated,
        });

        return updated;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("updateTask failed", error);
        throw new CoreError("TASK_UPDATE_FAILED", "Failed to update task.");
      }
    },

    async completeTask(input) {
      const values = taskIdSchema.parse(input);
      const existing = await this.getTask(values);
      if (existing.archivedAt) {
        throw new CoreError(
          "TASK_NOT_EDITABLE",
          "Archived tasks cannot be completed.",
        );
      }
      if (existing.status === "completed") {
        return existing;
      }
      if (existing.status === "cancelled") {
        throw new CoreError(
          "TASK_NOT_EDITABLE",
          "Cancelled tasks cannot be completed.",
        );
      }

      try {
        const updated = await repository.updateTask({
          workspaceId: values.workspaceId,
          companyId: values.companyId,
          taskId: values.taskId,
          actorId: input.actorId,
          status: "completed",
          completedDate: todayDateString(),
        });
        await recordTaskUpdateActivities({
          before: existing,
          after: updated,
          actorId: input.actorId,
          touched: { status: true },
        });
        recordTaskAudit({
          action: "update",
          actorId: input.actorId,
          before: existing,
          after: updated,
          metadata: { reason: "complete" },
        });
        return updated;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("completeTask failed", error);
        throw new CoreError("TASK_COMPLETE_FAILED", "Failed to complete task.");
      }
    },

    async archiveTask(input) {
      const values = taskIdSchema.parse(input);
      const existing = await this.getTask(values);
      if (existing.archivedAt) {
        return existing;
      }

      try {
        const updated = await setTaskArchivedAt(
          values.taskId,
          values.workspaceId,
          values.companyId,
          new Date().toISOString(),
        );
        recordTaskAudit({
          action: "archive",
          actorId: input.actorId,
          before: existing,
          after: updated,
        });
        return updated;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("archiveTask failed", error);
        throw new CoreError("TASK_ARCHIVE_FAILED", "Failed to archive task.");
      }
    },

    async restoreTask(input) {
      const values = taskIdSchema.parse(input);
      const existing = await this.getTask(values);
      if (!existing.archivedAt) {
        throw new CoreError(
          "TASK_NOT_ARCHIVED",
          "Only archived tasks can be restored.",
        );
      }

      try {
        const updated = await setTaskArchivedAt(
          values.taskId,
          values.workspaceId,
          values.companyId,
          null,
        );
        recordTaskAudit({
          action: "restore",
          actorId: input.actorId,
          before: existing,
          after: updated,
        });
        return updated;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("restoreTask failed", error);
        throw new CoreError("TASK_RESTORE_FAILED", "Failed to restore task.");
      }
    },

    async deleteTask(input) {
      const values = deleteTaskSchema.parse(input);
      const existing = await this.getTask({
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        taskId: values.taskId,
      });
      try {
        await recordTaskDeletedActivity(existing, values.actorId);
        recordTaskAudit({
          action: "delete",
          actorId: values.actorId,
          before: existing,
          after: existing,
        });
        await repository.deleteTask(values.taskId, values.workspaceId);
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("deleteTask failed", error);
        throw new CoreError("TASK_DELETE_FAILED", "Failed to delete task.");
      }
    },

    async assignTask(input) {
      const values = assignTaskSchema.parse(input);
      const existing = await this.getTask({
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        taskId: values.taskId,
      });
      assertEditable(existing);
      try {
        const updated = await repository.assignTask(values);
        await recordAssignmentActivity({
          before: existing,
          after: updated,
          actorId: values.actorId,
          role: values.role,
        });
        recordTaskAudit({
          action: "update",
          actorId: values.actorId,
          before: existing,
          after: updated,
          metadata: { reason: "assign", role: values.role },
        });
        return updated;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("assignTask failed", error);
        throw new CoreError("TASK_ASSIGN_FAILED", "Failed to assign task.");
      }
    },

    async unassignTask(input) {
      const values = unassignTaskSchema.parse(input);
      const existing = await this.getTask({
        workspaceId: values.workspaceId,
        companyId: values.companyId,
        taskId: values.taskId,
      });
      assertEditable(existing);
      try {
        const updated = await repository.unassignTask(values);
        await recordAssignmentActivity({
          before: existing,
          after: updated,
          actorId: values.actorId,
          role: values.role,
        });
        recordTaskAudit({
          action: "update",
          actorId: values.actorId,
          before: existing,
          after: updated,
          metadata: { reason: "unassign", role: values.role },
        });
        return updated;
      } catch (error) {
        if (error instanceof CoreError) throw error;
        console.error("unassignTask failed", error);
        throw new CoreError("TASK_UNASSIGN_FAILED", "Failed to unassign task.");
      }
    },
  };
}

export const taskService: TaskService = createTaskService(taskRepository);

export const getTask = taskService.getTask.bind(taskService);
export const listTasks = taskService.listTasks.bind(taskService);
export const listTasksByProject =
  taskService.listTasksByProject.bind(taskService);
export const listTasksByClient =
  taskService.listTasksByClient.bind(taskService);
export const listTasksByVendor =
  taskService.listTasksByVendor.bind(taskService);
export const listTasksByMeeting =
  taskService.listTasksByMeeting.bind(taskService);
export const createTask = taskService.createTask.bind(taskService);
export const updateTask = taskService.updateTask.bind(taskService);
export const completeTask = taskService.completeTask.bind(taskService);
export const archiveTask = taskService.archiveTask.bind(taskService);
export const restoreTask = taskService.restoreTask.bind(taskService);
export const deleteTask = taskService.deleteTask.bind(taskService);
export const assignTask = taskService.assignTask.bind(taskService);
export const unassignTask = taskService.unassignTask.bind(taskService);
