import { z } from "zod";

import {
  WEDDING_TIMELINE_ASSIGNMENT_ROLES,
  WEDDING_TIMELINE_ASSIGNMENT_TYPES,
  WEDDING_TIMELINE_ITEM_TYPES,
  WEDDING_TIMELINE_PHASES,
  WEDDING_TIMELINE_PRIORITIES,
  WEDDING_TIMELINE_SCHEDULE_STATES,
  WEDDING_TIMELINE_SOURCES,
  WEDDING_TIMELINE_STATUSES,
} from "@/core/wedding-timeline/constants";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, "Time must be HH:MM")
  .optional()
  .nullable();

const assignmentSchema = z.object({
  id: z.string().min(1).max(80),
  role: z.enum(WEDDING_TIMELINE_ASSIGNMENT_ROLES).optional(),
  assignmentType: z.enum(WEDDING_TIMELINE_ASSIGNMENT_TYPES).optional(),
  label: z.string().max(200),
  personId: z.string().uuid().nullable().optional(),
  vendorId: z.string().uuid().nullable().optional(),
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

const scopeSchema = {
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
};

export const createWeddingTimelineItemSchema = z.object({
  ...scopeSchema,
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional().nullable(),
  /** Compat HH:MM — converted to scheduled_start using wedding_date + TZ. */
  startTime: timeSchema,
  endTime: timeSchema,
  scheduledStart: z.string().datetime({ offset: true }).optional().nullable(),
  durationMinutes: z.number().int().nonnegative().optional().nullable(),
  sortOrder: z.number().int().nonnegative().optional(),
  /** @deprecated use sortOrder */
  sequence: z.number().int().nonnegative().optional(),
  category: z.string().max(80).optional().nullable(),
  phase: z.enum(WEDDING_TIMELINE_PHASES).optional().nullable(),
  itemType: z.enum(WEDDING_TIMELINE_ITEM_TYPES).optional(),
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
  predecessorIds: z.array(z.string().uuid()).optional(),
  bufferBeforeMinutes: z.number().int().nonnegative().optional().nullable(),
  bufferAfterMinutes: z.number().int().nonnegative().optional().nullable(),
  packageItemId: z.string().uuid().optional().nullable(),
  source: z.enum(WEDDING_TIMELINE_SOURCES).optional(),
  delayMinutes: z.number().int().optional().nullable(),
  actualStartAt: z.string().datetime({ offset: true }).optional().nullable(),
  actualEndAt: z.string().datetime({ offset: true }).optional().nullable(),
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
  ...scopeSchema,
  itemId: z.string().uuid(),
});

export type WeddingTimelineItemIdInput = z.infer<
  typeof weddingTimelineItemIdSchema
>;

export const reorderWeddingTimelineSchema = z.object({
  ...scopeSchema,
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type ReorderWeddingTimelineInput = z.infer<
  typeof reorderWeddingTimelineSchema
>;

export const shiftWeddingTimelineSchema = z.object({
  ...scopeSchema,
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
  ...scopeSchema,
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

export const ensureWeddingTimelineScheduleSchema = z.object({
  ...scopeSchema,
});

export type EnsureWeddingTimelineScheduleInput = z.infer<
  typeof ensureWeddingTimelineScheduleSchema
>;

export const updateWeddingTimelineScheduleStateSchema = z.object({
  ...scopeSchema,
  timelineState: z.enum(WEDDING_TIMELINE_SCHEDULE_STATES),
});

export type UpdateWeddingTimelineScheduleStateInput = z.infer<
  typeof updateWeddingTimelineScheduleStateSchema
>;
