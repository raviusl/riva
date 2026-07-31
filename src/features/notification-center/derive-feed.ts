/**
 * Notification Center derive — thin consumer over Platform Event Bus (Project 088).
 * Entity derivation lives in `@/core/platform-events`; this file only maps.
 */

import {
  derivePlatformEvents,
  type DerivePlatformEventsInput,
} from "@/core/platform-events";
import type { Meeting } from "@/core/meeting/types";
import type { Task } from "@/core/task/types";
import type { Client, Project, Vendor } from "@/core/types";
import {
  consumeNotificationCenterFromEvents,
  type NotificationCenterItem,
} from "@/features/notification-center/from-platform-events";

export type { NotificationCenterItem };

type DeriveInput = {
  companyId: string;
  workspaceId: string;
  recipientId: string;
  now?: Date;
  tasks?: readonly Task[];
  meetings?: readonly Meeting[];
  clients?: readonly Client[];
  vendors?: readonly Vendor[];
  projects?: readonly Project[];
  includePlaceholders?: boolean;
  milestones?: DerivePlatformEventsInput["milestones"];
};

/**
 * Build the company-scoped notification feed for one recipient.
 * Callers must only pass entities the user is allowed to see.
 */
export function deriveNotificationCenterFeed(
  input: DeriveInput,
): NotificationCenterItem[] {
  const events = derivePlatformEvents({
    companyId: input.companyId,
    workspaceId: input.workspaceId,
    recipientId: input.recipientId,
    now: input.now,
    tasks: input.tasks,
    meetings: input.meetings,
    clients: input.clients,
    vendors: input.vendors,
    projects: input.projects,
    milestones: input.milestones,
    includePlaceholders: input.includePlaceholders,
  });

  return consumeNotificationCenterFromEvents(events, input.recipientId);
}
