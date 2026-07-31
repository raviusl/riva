/**
 * Project 076 — Global Notification Center feature surface.
 */

export type { NotificationCenterKind } from "@/features/notification-center/kinds";
export { NOTIFICATION_CENTER_KINDS } from "@/features/notification-center/kinds";

export type { NotificationCenterItem } from "@/features/notification-center/from-platform-events";
export { deriveNotificationCenterFeed } from "@/features/notification-center/derive-feed";
export {
  consumeNotificationCenterFromEvents,
  mapPlatformEventToNotificationItem,
} from "@/features/notification-center/from-platform-events";

export {
  NotificationCenterProvider,
  useNotificationCenter,
  useNotificationCenterOptional,
} from "@/features/notification-center/notification-center-provider";

export { NotificationCenterTrigger } from "@/features/notification-center/notification-center-panel";
