import { z } from "zod";

import {
  WEDDING_TIMELINE_ASSIGNMENT_ROLES,
  WEDDING_TIMELINE_PRIORITIES,
  WEDDING_TIMELINE_STATUSES,
} from "@/core/wedding-timeline/constants";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Time must be HH:MM")
  .optional()
  .nullable();

const assignmentSchema = z.object({
  id: z.string().min(1).max(80),
  role: z.enum(WEDDING_TIMELINE_ASSIGNMENT_ROLES),
  label: z.string().max(200),
  personId: z.string().uuid().nullable().optional(),
});

const checklistSchema = z.object({
  id: z.string().min(1).max(80),
  label: z.string().max(300),
  done: z.boolean(),
});

const attachmentSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().max(300),
  url: z.string().max(2000).nullable(),
  mimeType: z.string().max(120).nullable(),
});

export const createWeddingTimelineItemSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional().nullable(),
  startTime: timeSchema,
  endTime: timeSchema,
  category: z.string().max(80).optional().nullable(),
  location: z.string().max(300).optional().nullable(),
  status: z.enum(WEDDING_TIMELINE_STATUSES).optional(),
  priority: z.enum(WEDDING_TIMELINE_PRIORITIES).optional(),
  reminderMinutes: z.number().int().nonnegative().optional().nullable(),
  picLabel: z.string().max(200).optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  coordinatorLabel: z.string().max(200).optional().nullable(),
  crew: z.string().max(500).optional().nullable(),
  assignments: z.array(assignmentSchema).optional(),
  checklist: z.array(checklistSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
  internalNotes: z.string().max(8000).optional().nullable(),
  dependsOnId: z.string().uuid().optional().nullable(),
  sequence: z.number().int().nonnegative().optional(),
});

export type CreateWeddingTimelineItemInput = z.infer<
  typeof createWeddingTimelineItemSchema
>;

export const updateWeddingTimelineItemSchema =
  createWeddingTimelineItemSchema.extend({
    itemId: z.string().uuid(),
  });

export type UpdateWeddingTimelineItemInput = z.infer<
  typeof updateWeddingTimelineItemSchema
>;

export const weddingTimelineItemIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
});

export type WeddingTimelineItemIdInput = z.infer<
  typeof weddingTimelineItemIdSchema
>;

export const reorderWeddingTimelineSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type ReorderWeddingTimelineInput = z.infer<
  typeof reorderWeddingTimelineSchema
>;

export const shiftWeddingTimelineSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  itemId: z.string().uuid(),
  newStartTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
  mode: z.enum(["item_only", "shift_following"]),
});

export type ShiftWeddingTimelineInput = z.infer<
  typeof shiftWeddingTimelineSchema
>;

export const bulkWeddingTimelineSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).min(1),
  action: z.enum([
    "archive",
    "restore",
    "delete",
    "status",
    "priority",
    "reminder",
  ]),
  status: z.enum(WEDDING_TIMELINE_STATUSES).optional(),
  priority: z.enum(WEDDING_TIMELINE_PRIORITIES).optional(),
  reminderMinutes: z.number().int().nonnegative().nullable().optional(),
});

export type BulkWeddingTimelineInput = z.infer<
  typeof bulkWeddingTimelineSchema
>;
