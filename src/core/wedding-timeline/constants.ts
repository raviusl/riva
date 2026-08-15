/**
 * Project 101 — Wedding Timeline constants (evolved from 099).
 */

export const WEDDING_TIMELINE_CATEGORIES = [
  "preparation",
  "makeup",
  "hair",
  "tea_ceremony",
  "rom",
  "lunch",
  "registration",
  "grand_entrance",
  "speech",
  "performance",
  "cake_cutting",
  "champagne",
  "first_march_out",
  "second_march_in",
  "photo_session",
  "sde",
  "lucky_draw",
  "dinner",
  "after_party",
  "others",
] as const;
export type WeddingTimelineCategory =
  (typeof WEDDING_TIMELINE_CATEGORIES)[number];

export const WEDDING_TIMELINE_STATUSES = [
  "not_started",
  "ready",
  "in_progress",
  "completed",
  "delayed",
  "cancelled",
] as const;
export type WeddingTimelineStatus =
  (typeof WEDDING_TIMELINE_STATUSES)[number];

export const WEDDING_TIMELINE_PRIORITIES = [
  "low",
  "normal",
  "high",
  "critical",
] as const;
export type WeddingTimelinePriority =
  (typeof WEDDING_TIMELINE_PRIORITIES)[number];

export const WEDDING_TIMELINE_REMINDERS = [5, 10, 15, 30, 60] as const;

export const WEDDING_TIMELINE_ITEM_TYPES = [
  "activity",
  "milestone",
  "call_time",
  "break",
  "buffer",
  "note",
] as const;
export type WeddingTimelineItemType =
  (typeof WEDDING_TIMELINE_ITEM_TYPES)[number];

export const WEDDING_TIMELINE_EXECUTION_ITEM_TYPES = [
  "activity",
  "milestone",
  "call_time",
  "break",
] as const;
export type WeddingTimelineExecutionItemType =
  (typeof WEDDING_TIMELINE_EXECUTION_ITEM_TYPES)[number];

export const WEDDING_TIMELINE_STRUCTURE_ITEM_TYPES = [
  "buffer",
  "note",
] as const;
export type WeddingTimelineStructureItemType =
  (typeof WEDDING_TIMELINE_STRUCTURE_ITEM_TYPES)[number];

export const WEDDING_TIMELINE_PHASES = [
  "prep",
  "ceremony",
  "reception",
  "post",
  "custom",
] as const;
export type WeddingTimelinePhase = (typeof WEDDING_TIMELINE_PHASES)[number];

export const WEDDING_TIMELINE_SOURCES = [
  "manual",
  "package_seed",
  "template",
  "ai",
  "orphaned_package",
] as const;
export type WeddingTimelineSource = (typeof WEDDING_TIMELINE_SOURCES)[number];

export const WEDDING_TIMELINE_SCHEDULE_STATES = [
  "draft",
  "planning",
  "confirmed",
  "ready",
  "live",
  "completed",
  "archived",
  "cancelled",
  "paused",
] as const;
export type WeddingTimelineScheduleState =
  (typeof WEDDING_TIMELINE_SCHEDULE_STATES)[number];

export const WEDDING_TIMELINE_ASSIGNMENT_TYPES = [
  "Owner",
  "Staff",
  "Vendor",
  "Couple",
  "Family",
  "Photographer",
  "Videographer",
  "MC",
  "Musician",
] as const;
export type WeddingTimelineAssignmentType =
  (typeof WEDDING_TIMELINE_ASSIGNMENT_TYPES)[number];

/** Legacy 099 role labels kept for UI compat until assignment editor ships. */
export const WEDDING_TIMELINE_ASSIGNMENT_ROLES = [
  "coordinator",
  "mc",
  "singer",
  "band",
  "photographer",
  "videographer",
  "venue",
  "hotel",
  "makeup_artist",
  "decorator",
  "family",
  "bride",
  "groom",
  "parents",
  "vip",
  "custom",
] as const;
export type WeddingTimelineAssignmentRole =
  (typeof WEDDING_TIMELINE_ASSIGNMENT_ROLES)[number];

export const WEDDING_TIMELINE_VIEWS = [
  "timeline",
  "table",
  "list",
  "wedding_day",
  "print",
  "calendar",
  "gantt",
] as const;
export type WeddingTimelineView = (typeof WEDDING_TIMELINE_VIEWS)[number];
