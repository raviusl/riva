import type {
  MeetingStatus,
  MeetingType,
} from "@/core/meeting/constants";

export type { MeetingStatus, MeetingType } from "@/core/meeting/constants";

export type MeetingId = string;

export type MeetingParticipant = {
  id: string;
  name: string;
  role?: string;
  email?: string;
};

/** Meeting CRM entity (table: crm_meetings). */
export type Meeting = {
  id: MeetingId;
  workspace_id: string;
  company_id: string;
  project_id: string | null;
  client_id: string | null;
  owner_id: string | null;
  title: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  starts_at: string;
  location: string | null;
  google_meet_link: string | null;
  notes: string | null;
  internal_notes: string | null;
  participants: MeetingParticipant[];
  vendor_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
};
