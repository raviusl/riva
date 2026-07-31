/**
 * Task platform surface.
 *
 * - Shared domain foundation: `@/core/task` (entity, enums, validation, contracts)
 * - Server persistence: `@/core/task/server`
 * - Project 010 catalog / relationship models: `@/types/task`
 */

export type {
  CreateTaskInput,
  ListTasksQuery,
  Task,
  TaskId,
  TaskIdInput,
  TaskModel,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from "@/core/task";

export {
  TASK_PRIORITIES,
  TASK_STATUSES,
  createTaskSchema,
  listTasksQuerySchema,
  taskIdSchema,
  taskPrioritySchema,
  taskSchema,
  taskStatusSchema,
  updateTaskSchema,
} from "@/core/task";

export type {
  TaskAssignee,
  TaskDependency,
  TaskDependencyRelationshipType,
  TaskReference,
} from "./relationships";

export type {
  TaskPriority as TaskPriorityDefinition,
  TaskPriorityId,
  TaskStatus as TaskStatusDefinition,
  TaskStatusId,
  TaskType,
  TaskTypeId,
} from "@/types/task";
