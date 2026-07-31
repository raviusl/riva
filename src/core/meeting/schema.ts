import { z } from "zod";

import {
  MEETING_STATUSES,
  MEETING_TYPES,
} from "@/core/meeting/constants";

export const meetingStatusSchema = z.enum(MEETING_STATUSES);
export const meetingTypeSchema = z.enum(MEETING_TYPES);

export const meetingParticipantSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(160),
  role: z.string().max(80).optional(),
  email: z.string().email().optional(),
});

export const meetingIdSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  meetingId: z.string().uuid(),
});

export type MeetingIdInput = z.infer<typeof meetingIdSchema>;

const timeRegex = /^\d{2}:\d{2}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createMeetingSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  vendorIds: z.array(z.string().uuid()).max(40).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  meetingType: meetingTypeSchema.optional(),
  status: meetingStatusSchema.optional(),
  meetingDate: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  meetingTime: z.string().regex(timeRegex, "Time must be HH:MM"),
  durationMinutes: z.number().int().min(15).max(24 * 60).optional(),
  location: z.string().max(300).optional().nullable(),
  googleMeetLink: z.string().max(500).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  internalNotes: z.string().max(8000).optional().nullable(),
  participants: z.array(meetingParticipantSchema).max(50).optional(),
  createdBy: z.string().uuid(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

export const updateMeetingSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  meetingId: z.string().uuid(),
  projectId: z.string().uuid().nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  vendorIds: z.array(z.string().uuid()).max(40).optional(),
  ownerId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  meetingType: meetingTypeSchema.optional(),
  status: meetingStatusSchema.optional(),
  meetingDate: z.string().regex(dateRegex, "Date must be YYYY-MM-DD"),
  meetingTime: z.string().regex(timeRegex, "Time must be HH:MM"),
  durationMinutes: z.number().int().min(15).max(24 * 60).optional(),
  location: z.string().max(300).optional().nullable(),
  googleMeetLink: z.string().max(500).optional().nullable(),
  notes: z.string().max(8000).optional().nullable(),
  internalNotes: z.string().max(8000).optional().nullable(),
  participants: z.array(meetingParticipantSchema).max(50).optional(),
});

export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;

export const listMeetingsQuerySchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  status: meetingStatusSchema.optional(),
});

export type ListMeetingsQuery = z.infer<typeof listMeetingsQuerySchema>;
