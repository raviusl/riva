/**
 * Chinese labels for default Timeline Engine milestones.
 */

import type { DefaultMilestoneKind } from "@/features/timeline-engine/defaults";
import type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";
import { uiZh } from "@/config/ui-zh";

export function defaultMilestoneTitle(kind: DefaultMilestoneKind): string {
  switch (kind) {
    case "inquiry":
      return uiZh.milestoneInquiry;
    case "consultation":
      return uiZh.milestoneConsultation;
    case "booking":
      return uiZh.milestoneBooking;
    case "planning":
      return uiZh.milestonePlanning;
    case "vendor_confirmation":
      return uiZh.milestoneVendorConfirmation;
    case "final_meeting":
      return uiZh.milestoneFinalMeeting;
    case "wedding_day":
      return uiZh.milestoneWeddingDay;
    case "completion":
      return uiZh.milestoneCompletion;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function defaultMilestoneDescription(
  kind: DefaultMilestoneKind,
): string {
  switch (kind) {
    case "inquiry":
      return uiZh.milestoneInquiryDesc;
    case "consultation":
      return uiZh.milestoneConsultationDesc;
    case "booking":
      return uiZh.milestoneBookingDesc;
    case "planning":
      return uiZh.milestonePlanningDesc;
    case "vendor_confirmation":
      return uiZh.milestoneVendorConfirmationDesc;
    case "final_meeting":
      return uiZh.milestoneFinalMeetingDesc;
    case "wedding_day":
      return uiZh.milestoneWeddingDayDesc;
    case "completion":
      return uiZh.milestoneCompletionDesc;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function formatMilestoneStatus(status: TimelineMilestoneStatus): string {
  switch (status) {
    case "pending":
      return uiZh.milestoneStatusPending;
    case "active":
      return uiZh.milestoneStatusActive;
    case "completed":
      return uiZh.milestoneStatusCompleted;
    case "skipped":
      return uiZh.milestoneStatusSkipped;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
