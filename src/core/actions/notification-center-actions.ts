"use server";

import { requireSessionContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import {
  createInMemoryPlatformEventBus,
  derivePlatformEvents,
  notificationEventConsumer,
  workflowEventConsumer,
} from "@/core/platform-events";
import { listProjectsByCompany } from "@/core/project/project";
import { listTasks } from "@/core/task/service";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { consumeNotificationCenterFromEvents } from "@/features/notification-center/from-platform-events";
import type { NotificationCenterItem } from "@/features/notification-center/from-platform-events";

export type LoadNotificationCenterResult =
  | {
      ok: true;
      data: {
        recipientId: string;
        items: NotificationCenterItem[];
      };
    }
  | { ok: false; error: string };

type LoadInput = {
  workspaceId: string;
  companyId: string;
};

/**
 * Load company-scoped Notification Center via Platform Event Bus.
 * Permissions gate which entity sources are queried.
 */
export async function loadNotificationCenterAction(
  input: LoadInput,
): Promise<LoadNotificationCenterResult> {
  try {
    const context = await requireSessionContext();
    if (
      context.workspace.id !== input.workspaceId ||
      context.company.id !== input.companyId
    ) {
      throw new CoreError(
        "NOTIFICATION_SCOPE_MISMATCH",
        "Notifications are limited to the active company.",
      );
    }

    const recipientId = context.userId;

    const [tasks, meetings, clients, vendors, projects] = await Promise.all([
      context.permissions.has("task.read")
        ? listTasks({
            workspaceId: input.workspaceId,
            companyId: input.companyId,
            includeArchived: false,
          })
        : Promise.resolve([]),
      context.permissions.has("meeting.read")
        ? listMeetingsByCompany(input.workspaceId, input.companyId)
        : Promise.resolve([]),
      context.permissions.has("client.read")
        ? listClientsByCompany(input.workspaceId, input.companyId)
        : Promise.resolve([]),
      context.permissions.has("vendor.read")
        ? listVendorsByCompany(input.workspaceId, input.companyId)
        : Promise.resolve([]),
      context.permissions.has("project.read")
        ? listProjectsByCompany(input.workspaceId, input.companyId)
        : Promise.resolve([]),
    ]);

    const events = derivePlatformEvents({
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      recipientId,
      tasks,
      meetings,
      clients,
      vendors,
      projects,
      includePlaceholders: true,
    });

    const bus = createInMemoryPlatformEventBus();
    bus.publish(events);
    void notificationEventConsumer.consume(bus.list({ channel: "notification" }));
    void workflowEventConsumer.consume(bus.list({ channel: "workflow" }));

    const items = consumeNotificationCenterFromEvents(events, recipientId);

    return { ok: true, data: { recipientId, items } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load notifications"),
    };
  }
}
