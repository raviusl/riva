import { z } from "zod";

import { TIMELINE_ENTRY_TYPES } from "@/core/timeline/constants";

export const timelineEntryTypeSchema = z.enum(TIMELINE_ENTRY_TYPES);

export const timelineEntryIdSchema = z.object({
  timelineEntryId: z.string().uuid(),
});

export type TimelineEntryIdInput = z.infer<typeof timelineEntryIdSchema>;

export const createTimelineEntrySchema = z.object({
  title: z.string().min(1).max(200),
  type: timelineEntryTypeSchema,
  occurredAt: z.string().min(1).max(64),
  relatedProjectId: z.string().uuid().optional().nullable(),
  relatedClientId: z.string().uuid().optional().nullable(),
  relatedVendorId: z.string().uuid().optional().nullable(),
  relatedMeetingId: z.string().uuid().optional().nullable(),
  relatedTaskId: z.string().uuid().optional().nullable(),
  createdBy: z.string().uuid(),
});

export type CreateTimelineEntryInput = z.infer<
  typeof createTimelineEntrySchema
>;

export const updateTimelineEntrySchema = z.object({
  timelineEntryId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  type: timelineEntryTypeSchema.optional(),
  occurredAt: z.string().min(1).max(64).optional(),
  relatedProjectId: z.string().uuid().optional().nullable(),
  relatedClientId: z.string().uuid().optional().nullable(),
  relatedVendorId: z.string().uuid().optional().nullable(),
  relatedMeetingId: z.string().uuid().optional().nullable(),
  relatedTaskId: z.string().uuid().optional().nullable(),
});

export type UpdateTimelineEntryInput = z.infer<
  typeof updateTimelineEntrySchema
>;

export const listTimelineEntriesQuerySchema = z.object({
  relatedProjectId: z.string().uuid().optional(),
  relatedClientId: z.string().uuid().optional(),
  relatedVendorId: z.string().uuid().optional(),
  relatedMeetingId: z.string().uuid().optional(),
  relatedTaskId: z.string().uuid().optional(),
  type: timelineEntryTypeSchema.optional(),
});

export type ListTimelineEntriesQuery = z.infer<
  typeof listTimelineEntriesQuerySchema
>;
