import type { TimelineEntryType } from "@/core/timeline/constants";

export type { TimelineEntryType } from "@/core/timeline/constants";

export type TimelineEntryId = string;

export type TimelineEntry = {
  id: TimelineEntryId;
  title: string;
  type: TimelineEntryType;
  occurredAt: string;
  relatedProjectId: string | null;
  relatedClientId: string | null;
  relatedVendorId: string | null;
  relatedMeetingId: string | null;
  relatedTaskId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
