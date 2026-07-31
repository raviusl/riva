"use server";

import { requireSessionContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import {
  activityEventConsumer,
  auditEventConsumer,
  createInMemoryPlatformEventBus,
  derivePlatformEvents,
  workflowEventConsumer,
} from "@/core/platform-events";
import { listProjectsByCompany } from "@/core/project/project";
import { listTaskActivities, listTasks } from "@/core/task/service";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { consumeActivityFeedFromEvents } from "@/features/activity-feed/from-platform-events";
import { groupActivityFeed } from "@/features/activity-feed/group-feed";
import type { ActivityFilter } from "@/features/activity-feed/kinds";
import type {
  ActivityFeedGroup,
  ActivityFeedItem,
} from "@/features/activity-feed/types";
import { buildCompanyMilestoneProjections } from "@/features/timeline-engine/build-projections";

export type LoadActivityFeedResult =
  | {
      ok: true;
      data: {
        items: ActivityFeedItem[];
        groups: ActivityFeedGroup[];
        availableFilters: ActivityFilter[];
      };
    }
  | { ok: false; error: string };

type LoadInput = {
  workspaceId: string;
  companyId: string;
  filter?: ActivityFilter;
  limit?: number;
  includePlaceholders?: boolean;
};

/**
 * Load company-scoped Activity Feed via Platform Event Bus.
 * Permission-gates each module source; never mixes companies.
 */
export async function loadActivityFeedAction(
  input: LoadInput,
): Promise<LoadActivityFeedResult> {
  try {
    const context = await requireSessionContext();
    if (
      context.workspace.id !== input.workspaceId ||
      context.company.id !== input.companyId
    ) {
      throw new CoreError(
        "ACTIVITY_SCOPE_MISMATCH",
        "Activity feed is limited to the active company.",
      );
    }

    const canProject = context.permissions.has("project.read");
    const canClient = context.permissions.has("client.read");
    const canVendor = context.permissions.has("vendor.read");
    const canMeeting = context.permissions.has("meeting.read");
    const canTask = context.permissions.has("task.read");
    const canTimeline = context.permissions.has("timeline.read");
    const canNotification = context.permissions.has("notification.read");

    if (
      !canProject &&
      !canClient &&
      !canVendor &&
      !canMeeting &&
      !canTask &&
      !canTimeline &&
      !canNotification
    ) {
      throw new CoreError(
        "PERMISSION_DENIED",
        "Missing permission to view activity sources.",
      );
    }

    const [projects, clients, vendors, meetings, tasks, taskActivities] =
      await Promise.all([
        canProject || canTimeline
          ? listProjectsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        canClient
          ? listClientsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        canVendor
          ? listVendorsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        canMeeting
          ? listMeetingsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        canTask
          ? listTasks({
              workspaceId: input.workspaceId,
              companyId: input.companyId,
              includeArchived: false,
            })
          : Promise.resolve([]),
        canTask
          ? listTaskActivities({
              workspaceId: input.workspaceId,
              companyId: input.companyId,
              limit: 80,
            })
          : Promise.resolve([]),
      ]);

    const milestones = canTimeline
      ? buildCompanyMilestoneProjections({
          projects,
          tasks: canTask ? tasks : [],
          meetings: canMeeting ? meetings : [],
        })
      : [];

    const events = derivePlatformEvents({
      companyId: input.companyId,
      workspaceId: input.workspaceId,
      recipientId: context.userId,
      projects: canProject || canTimeline ? projects : [],
      clients: canClient ? clients : [],
      vendors: canVendor ? vendors : [],
      meetings: canMeeting ? meetings : [],
      tasks: canTask ? tasks : [],
      taskActivities: canTask ? taskActivities : [],
      milestones,
      includePlaceholders: input.includePlaceholders ?? true,
    });

    const bus = createInMemoryPlatformEventBus();
    bus.publish(events);
    // Channel consumers share the same event snapshot (no peer engine calls).
    void activityEventConsumer.consume(bus.list({ channel: "activity" }));
    void workflowEventConsumer.consume(bus.list({ channel: "workflow" }));
    void auditEventConsumer.consume(bus.list({ channel: "audit" }));

    const items = consumeActivityFeedFromEvents(events, {
      filter: input.filter ?? "all",
      limit: input.limit,
    });
    const groups = groupActivityFeed(items);

    const availableFilters: ActivityFilter[] = ["all"];
    if (canProject) availableFilters.push("projects");
    if (canClient) availableFilters.push("clients");
    if (canMeeting) availableFilters.push("meetings");
    if (canTask) availableFilters.push("tasks");
    if (canTimeline) availableFilters.push("timeline");
    if (canNotification) availableFilters.push("notifications");

    return {
      ok: true,
      data: { items, groups, availableFilters },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load activity feed"),
    };
  }
}
