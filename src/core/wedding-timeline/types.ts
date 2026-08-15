/**
 * Project 101 — Wedding Timeline types (evolved from 099).
 */

import type {
  WeddingTimelineAssignmentRole,
  WeddingTimelineAssignmentType,
  WeddingTimelineCategory,
  WeddingTimelineItemType,
  WeddingTimelinePhase,
  WeddingTimelinePriority,
  WeddingTimelineScheduleState,
  WeddingTimelineSource,
  WeddingTimelineStatus,
} from "@/core/wedding-timeline/constants";

export type WeddingTimelineAssignment = {
  id: string;
  /** Legacy 099 role for UI compat. */
  role: WeddingTimelineAssignmentRole;
  label: string;
  personId?: string | null;
  /** Project 101 assignment type (normalized). */
  assignmentType?: WeddingTimelineAssignmentType;
  vendorId?: string | null;
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

export type WeddingTimelineItemDependency = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  predecessor_item_id: string;
  successor_item_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type WeddingTimelineSchedule = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  timeline_state: WeddingTimelineScheduleState;
  previous_execution_state: WeddingTimelineScheduleState | null;
  emergency_unlock_until: string | null;
  emergency_unlock_by: string | null;
  confirmed_at: string | null;
  ready_at: string | null;
  live_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  cancelled_at: string | null;
  paused_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type WeddingTimelineItem = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  /** Project 101 SoT for manual order. */
  sort_order: number;
  /**
   * Legacy alias of sort_order for HEAD builder compat until M2.
   * @deprecated use sort_order
   */
  sequence: number;
  scheduled_start: string | null;
  duration_minutes: number | null;
  scheduled_end: string | null;
  /**
   * Derived HH:MM from scheduled_start in project/workspace TZ (compat).
   * @deprecated use scheduled_start
   */
  start_time: string | null;
  /**
   * Derived HH:MM from scheduled_start + duration (compat).
   * @deprecated use duration_minutes
   */
  end_time: string | null;
  title: string;
  description: string | null;
  category: WeddingTimelineCategory | string | null;
  phase: WeddingTimelinePhase | null;
  item_type: WeddingTimelineItemType;
  location: string | null;
  status: WeddingTimelineStatus;
  priority: WeddingTimelinePriority;
  reminder_minutes: number | null;
  pic_label: string | null;
  vendor_id: string | null;
  coordinator_label: string | null;
  crew: string | null;
  /** Hydrated from timeline_assignments (compat shape). */
  assignments: WeddingTimelineAssignment[];
  checklist: WeddingTimelineChecklistItem[];
  attachments: WeddingTimelineAttachment[];
  internal_notes: string | null;
  /** First predecessor id for compat; SoT is dependency table. */
  depends_on_id: string | null;
  predecessor_ids: string[];
  buffer_before_minutes: number | null;
  buffer_after_minutes: number | null;
  package_item_id: string | null;
  source: WeddingTimelineSource;
  actual_start_at: string | null;
  actual_end_at: string | null;
  delay_minutes: number | null;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};
