import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/core/task/constants";

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);
export const taskAssignmentRoleSchema = z.enum(["owner", "assignee"]);

const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .optional()
  .nullable();

export const taskIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  taskId: z.string().uuid(),
});

export type TaskIdInput = z.infer<typeof taskIdSchema>;

export const createTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  status: taskStatusSchema.optional().default("todo"),
  priority: taskPrioritySchema.optional().default("normal"),
  startDate: optionalDateSchema,
  dueDate: optionalDateSchema,
  completedDate: optionalDateSchema,
  ownerId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  followers: z.array(z.string().uuid()).max(40).optional(),
  relatedProjectId: z.string().uuid().optional().nullable(),
  relatedClientId: z.string().uuid().optional().nullable(),
  relatedVendorId: z.string().uuid().optional().nullable(),
  relatedMeetingId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  createdBy: z.string().uuid(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  taskId: z.string().uuid(),
  actorId: z.string().uuid(),
  title: z.string().min(1, "Task title is required").max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  startDate: optionalDateSchema,
  dueDate: optionalDateSchema,
  completedDate: optionalDateSchema,
  ownerId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  followers: z.array(z.string().uuid()).max(40).optional(),
  relatedProjectId: z.string().uuid().optional().nullable(),
  relatedClientId: z.string().uuid().optional().nullable(),
  relatedVendorId: z.string().uuid().optional().nullable(),
  relatedMeetingId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).max(20).optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const listTasksQuerySchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  relatedProjectId: z.string().uuid().optional(),
  relatedMeetingId: z.string().uuid().optional(),
  relatedClientId: z.string().uuid().optional(),
  relatedVendorId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  includeArchived: z.boolean().optional(),
});

export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export const assignTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  taskId: z.string().uuid(),
  actorId: z.string().uuid(),
  role: taskAssignmentRoleSchema,
  userId: z.string().uuid(),
});

export type AssignTaskInput = z.infer<typeof assignTaskSchema>;

export const unassignTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  taskId: z.string().uuid(),
  actorId: z.string().uuid(),
  role: taskAssignmentRoleSchema,
});

export type UnassignTaskInput = z.infer<typeof unassignTaskSchema>;

export const deleteTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  taskId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;

/** Full Task shape validation (read model). */
export const taskSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  completedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  ownerId: z.string().uuid().nullable(),
  assigneeId: z.string().uuid().nullable(),
  followers: z.array(z.string().uuid()),
  relatedProjectId: z.string().uuid().nullable(),
  relatedClientId: z.string().uuid().nullable(),
  relatedVendorId: z.string().uuid().nullable(),
  relatedMeetingId: z.string().uuid().nullable(),
  tags: z.array(z.string()),
  archivedAt: z.string().nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
