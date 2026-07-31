import type {
  CreateMeetingInput,
  MeetingIdInput,
  UpdateMeetingInput,
} from "@/core/meeting/schema";
import type { Meeting } from "@/core/meeting/types";

/** Meeting domain service contract. */
export interface MeetingService {
  getMeetingById(
    meetingId: string,
    workspaceId?: string,
    companyId?: string,
  ): Promise<Meeting>;
  listMeetingsByCompany(
    workspaceId: string,
    companyId: string,
  ): Promise<Meeting[]>;
  createMeeting(input: CreateMeetingInput): Promise<Meeting>;
  updateMeeting(input: UpdateMeetingInput): Promise<Meeting>;
  cancelMeeting(input: MeetingIdInput): Promise<Meeting>;
  completeMeeting(input: MeetingIdInput): Promise<Meeting>;
}
