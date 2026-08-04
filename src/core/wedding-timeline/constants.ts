/**
 * Project 099 — Wedding Timeline Builder constants.
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

export const WEDDING_TIMELINE_REMINDERS = [
  5, 10, 15, 30, 60,
] as const;

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
