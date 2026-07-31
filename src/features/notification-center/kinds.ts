/**
 * Notification Center event kinds (Project 076).
 * Stored on Notification.metadata.kind — reuses core Notification entity.
 */

export const NOTIFICATION_CENTER_KINDS = [
  "task_assigned",
  "task_due_today",
  "task_overdue",
  "meeting_reminder",
  "meeting_updated",
  "client_created",
  "vendor_assigned",
  "project_updated",
  // Future-ready placeholders
  "invoice",
  "documents",
  "calendar",
] as const;

export type NotificationCenterKind =
  (typeof NOTIFICATION_CENTER_KINDS)[number];

export function isNotificationCenterKind(
  value: unknown,
): value is NotificationCenterKind {
  return (
    typeof value === "string" &&
    (NOTIFICATION_CENTER_KINDS as readonly string[]).includes(value)
  );
}
