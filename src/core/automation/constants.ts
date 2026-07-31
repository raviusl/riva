/**
 * Automation domain constants (types, statuses, triggers, conditions, actions).
 */

export const AUTOMATION_TYPES = [
  "workflow",
  "rule",
  "trigger",
  "condition",
  "action",
  "execution",
] as const;
export type AutomationType = (typeof AUTOMATION_TYPES)[number];

export const AUTOMATION_STATUSES = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;
export type AutomationStatus = (typeof AUTOMATION_STATUSES)[number];

export const AUTOMATION_EXECUTION_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;
export type AutomationExecutionStatus =
  (typeof AUTOMATION_EXECUTION_STATUSES)[number];

export const AUTOMATION_TRIGGER_TYPES = [
  "task_created",
  "task_updated",
  "task_completed",
  "meeting_created",
  "meeting_updated",
  "meeting_started",
  "meeting_finished",
  "project_created",
  "project_status_changed",
  "client_created",
  "vendor_created",
  "document_uploaded",
  "invoice_paid",
  "invoice_overdue",
  "manual",
  "time_schedule",
] as const;
export type AutomationTriggerType = (typeof AUTOMATION_TRIGGER_TYPES)[number];

export const AUTOMATION_CONDITION_TYPES = [
  "equals",
  "not_equals",
  "contains",
  "starts_with",
  "ends_with",
  "greater_than",
  "less_than",
  "between",
  "empty",
  "not_empty",
] as const;
export type AutomationConditionType =
  (typeof AUTOMATION_CONDITION_TYPES)[number];

export const AUTOMATION_ACTION_TYPES = [
  "create_task",
  "update_task",
  "send_notification",
  "create_meeting",
  "create_document",
  "update_project",
  "assign_user",
  "webhook",
  "delay",
] as const;
export type AutomationActionType = (typeof AUTOMATION_ACTION_TYPES)[number];
