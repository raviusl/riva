/**
 * Notification permission keys (placeholder).
 * Enforcement is deferred until the permission engine wires domain modules.
 */

export const NOTIFICATION_PERMISSIONS = [
  "notification.read",
  "notification.write",
  "notification.delete",
  "notification.manage",
] as const;

export type NotificationPermission =
  (typeof NOTIFICATION_PERMISSIONS)[number];
