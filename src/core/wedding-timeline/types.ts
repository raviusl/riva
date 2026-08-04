/**
 * Project 099 — Wedding Timeline item types.
 */

import type {
  WeddingTimelineAssignmentRole,
  WeddingTimelineCategory,
  WeddingTimelinePriority,
  WeddingTimelineStatus,
} from "@/core/wedding-timeline/constants";

export type WeddingTimelineAssignment = {
  id: string;
  role: WeddingTimelineAssignmentRole;
  label: string;
  personId?: string | null;
};

export type WeddingTimelineChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type WeddingTimelineAttachment = {
  id: string;
  name: string;
  url: string | null;
  mimeType: string | null;
};

export type WeddingTimelineItem = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  sequence: number;
  /** HH:MM:SS or HH:MM */
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  category: WeddingTimelineCategory | string | null;
  location: string | null;
  status: WeddingTimelineStatus;
  priority: WeddingTimelinePriority;
  reminder_minutes: number | null;
  pic_label: string | null;
  vendor_id: string | null;
  coordinator_label: string | null;
  crew: string | null;
  assignments: WeddingTimelineAssignment[];
  checklist: WeddingTimelineChecklistItem[];
  attachments: WeddingTimelineAttachment[];
  internal_notes: string | null;
  depends_on_id: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
