/**
 * Task domain — public contracts (client-safe).
 * Server persistence lives in `@/core/task/server`.
 */

export type {
  Task,
  TaskAssignmentRole,
  TaskId,
  TaskModel,
  TaskPriority,
  TaskStatus,
} from "@/core/task/types";

export { TASK_PRIORITIES, TASK_STATUSES } from "@/core/task/constants";

export type {
  AssignTaskInput,
  CreateTaskInput,
  DeleteTaskInput,
  ListTasksQuery,
  TaskIdInput,
  UnassignTaskInput,
  UpdateTaskInput,
} from "@/core/task/schema";

export {
  assignTaskSchema,
  createTaskSchema,
  deleteTaskSchema,
  listTasksQuerySchema,
  taskAssignmentRoleSchema,
  taskIdSchema,
  taskPrioritySchema,
  taskSchema,
  taskStatusSchema,
  unassignTaskSchema,
  updateTaskSchema,
} from "@/core/task/schema";

export type {
  CreateTaskActivityInput,
  ListTaskActivitiesQuery,
  TaskActivity,
  TaskActivityType,
} from "@/core/task/activity-types";
export { TASK_ACTIVITY_TYPES } from "@/core/task/activity-types";

export type { TaskPermission } from "@/core/task/permissions";
export { TASK_PERMISSIONS } from "@/core/task/permissions";

export type { TaskDomainEvent, TaskEventName } from "@/core/task/events";
export { TASK_EVENTS } from "@/core/task/events";
