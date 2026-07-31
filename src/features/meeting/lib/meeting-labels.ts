import type { MeetingStatus, MeetingType } from "@/core/meeting/types";
import { uiZh } from "@/config/ui-zh";

export function meetingStatusLabel(status: MeetingStatus): string {
  switch (status) {
    case "scheduled":
      return uiZh.scheduled;
    case "confirmed":
      return uiZh.confirmed;
    case "completed":
      return uiZh.completed;
    case "cancelled":
      return uiZh.cancelled;
    case "no_show":
      return uiZh.noShow;
    default:
      return status;
  }
}

export function meetingTypeLabel(type: MeetingType): string {
  switch (type) {
    case "follow_up":
      return uiZh.meetingTypeFollowUp;
    case "venue_visit":
      return uiZh.meetingTypeVenueVisit;
    case "vendor_discussion":
      return uiZh.meetingTypeVendorDiscussion;
    case "internal_meeting":
      return uiZh.meetingTypeInternal;
    case "wedding_rehearsal":
      return uiZh.meetingTypeRehearsal;
    case "consultation":
      return uiZh.meetingTypeConsultation;
    default:
      return uiZh.meetingTypeOther;
  }
}
