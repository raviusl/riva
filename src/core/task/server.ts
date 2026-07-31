/**
 * Task domain — server-only persistence surface.
 * Import from here in Server Components / actions / repositories only.
 */

import "server-only";

export type { TaskRepository } from "@/core/task/repository";
export {
  assignTask as assignTaskRow,
  createTask as createTaskRow,
  deleteTask as deleteTaskRow,
  getTaskById,
  listTasks as listTaskRows,
  listTasksByClient as listTaskRowsByClient,
  listTasksByMeeting as listTaskRowsByMeeting,
  listTasksByProject as listTaskRowsByProject,
  listTasksByVendor as listTaskRowsByVendor,
  taskRepository,
  unassignTask as unassignTaskRow,
  updateTask as updateTaskRow,
} from "@/core/task/repository";

export {
  createTaskActivity as createTaskActivityRow,
  listTaskActivities as listTaskActivityRows,
} from "@/core/task/activity-repository";

export type { TaskService } from "@/core/task/service";
export {
  archiveTask,
  assignTask,
  completeTask,
  createTask,
  deleteTask,
  getTask,
  listTaskActivities,
  listTasks,
  listTasksByClient,
  listTasksByMeeting,
  listTasksByProject,
  listTasksByVendor,
  restoreTask,
  taskService,
  unassignTask,
  updateTask,
} from "@/core/task/service";

export {
  listTaskAuditTrail,
  recordTaskAudit,
} from "@/core/task/audit";
