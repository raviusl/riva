/**
 * Meeting domain — Project 054 CRM implementation.
 */

export type {
  Meeting,
  MeetingId,
  MeetingParticipant,
  MeetingStatus,
  MeetingType,
} from "@/core/meeting/types";
export {
  EDITABLE_MEETING_STATUSES,
  MEETING_STATUSES,
  MEETING_TYPES,
} from "@/core/meeting/constants";

export type {
  CreateMeetingInput,
  ListMeetingsQuery,
  MeetingIdInput,
  UpdateMeetingInput,
} from "@/core/meeting/schema";

export {
  createMeetingSchema,
  listMeetingsQuerySchema,
  meetingIdSchema,
  meetingParticipantSchema,
  meetingStatusSchema,
  meetingTypeSchema,
  updateMeetingSchema,
} from "@/core/meeting/schema";

export type { MeetingService } from "@/core/meeting/service";

export type { MeetingPermission } from "@/core/meeting/permissions";
export { MEETING_PERMISSIONS } from "@/core/meeting/permissions";

export type { MeetingDomainEvent, MeetingEventName } from "@/core/meeting/events";
export { MEETING_EVENTS } from "@/core/meeting/events";

export {
  buildMeetingStartsAt,
  cancelMeeting,
  completeMeeting,
  createMeeting,
  getMeetingById,
  listMeetingsByClient,
  listMeetingsByCompany,
  listMeetingsByProject,
  listMeetingsByVendor,
  updateMeeting,
} from "@/core/meeting/meeting";

export {
  listMeetingAuditTrail,
  recordMeetingAudit,
} from "@/core/meeting/audit";
