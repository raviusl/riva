import { z } from "zod";

import {
  WEDDING_TASK_PRIORITIES,
  WEDDING_TASK_STATUSES,
} from "@/core/wedding-task/constants";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .optional()
  .nullable();

const attachmentSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().max(300),
  url: z.string().max(2000).nullable(),
  mimeType: z.string().max(120).nullable(),
});

const commentSchema = z.object({
  id: z.string().min(1).max(80),
  body: z.string().min(1).max(4000),
  authorLabel: z.string().max(200),
  authorId: z.string().uuid().nullable().optional(),
  createdAt: z.string().min(1).max(80),
});

export const createWeddingTaskSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(8000).optional().nullable(),
  status: z.enum(WEDDING_TASK_STATUSES).optional(),
  priority: z.enum(WEDDING_TASK_PRIORITIES).optional(),
  dueDate: dateSchema,
  startDate: dateSchema,
  reminderMinutes: z.number().int().nonnegative().optional().nullable(),
  assigneeLabel: z.string().max(200).optional().nullable(),
  assigneePersonId: z.string().uuid().optional().nullable(),
  clientId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  coordinatorLabel: z.string().max(200).optional().nullable(),
  packageLabel: z.string().max(300).optional().nullable(),
  tags: z.array(z.string().min(1).max(80)).max(40).optional(),
  attachments: z.array(attachmentSchema).optional(),
  comments: z.array(commentSchema).optional(),
  internalNotes: z.string().max(8000).optional().nullable(),
  sequence: z.number().int().nonnegative().optional(),
});

export type CreateWeddingTaskInput = z.infer<typeof createWeddingTaskSchema>;

export const updateWeddingTaskSchema = createWeddingTaskSchema.extend({
  taskId: z.string().uuid(),
});

export type UpdateWeddingTaskInput = z.infer<typeof updateWeddingTaskSchema>;

export const weddingTaskIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  taskId: z.string().uuid(),
});

export type WeddingTaskIdInput = z.infer<typeof weddingTaskIdSchema>;

export const reorderWeddingTasksSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type ReorderWeddingTasksInput = z.infer<
  typeof reorderWeddingTasksSchema
>;

export const bulkWeddingTasksSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  taskIds: z.array(z.string().uuid()).min(1),
  action: z.enum([
    "archive",
    "restore",
    "delete",
    "status",
    "priority",
    "complete",
    "reminder",
  ]),
  status: z.enum(WEDDING_TASK_STATUSES).optional(),
  priority: z.enum(WEDDING_TASK_PRIORITIES).optional(),
  reminderMinutes: z.number().int().nonnegative().nullable().optional(),
});

export type BulkWeddingTasksInput = z.infer<typeof bulkWeddingTasksSchema>;

export const addWeddingTaskCommentSchema = weddingTaskIdSchema.extend({
  body: z.string().min(1).max(4000),
  authorLabel: z.string().max(200).optional(),
});

export type AddWeddingTaskCommentInput = z.infer<
  typeof addWeddingTaskCommentSchema
>;

export const addWeddingTaskAttachmentSchema = weddingTaskIdSchema.extend({
  name: z.string().min(1).max(300),
  url: z.string().max(2000).nullable().optional(),
  mimeType: z.string().max(120).nullable().optional(),
});

export type AddWeddingTaskAttachmentInput = z.infer<
  typeof addWeddingTaskAttachmentSchema
>;
