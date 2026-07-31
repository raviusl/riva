import "server-only";

import { listClientsByCompany } from "@/core/client/client";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import { listProjectsByCompany } from "@/core/project/project";
import { listTaskActivities, listTasks } from "@/core/task/service";
import type {
  TimelineAggregationQuery,
  TimelineAggregationResult,
  TimelineFeedItem,
} from "@/core/timeline/feed-types";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { TASK_WORKSPACE_HUB_ID } from "@/features/task/lib/task-types";
import { buildTaskWorkspaceTabHref } from "@/features/task/lib/task-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

function sortByOccurredAtDesc(items: TimelineFeedItem[]): TimelineFeedItem[] {
  return [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

function splitUpcomingPast(
  items: TimelineFeedItem[],
  nowIso: string,
): { upcoming: TimelineFeedItem[]; past: TimelineFeedItem[] } {
  const upcoming: TimelineFeedItem[] = [];
  const past: TimelineFeedItem[] = [];
  for (const item of items) {
    if (item.occurredAt >= nowIso) {
      upcoming.push(item);
    } else {
      past.push(item);
    }
  }
  return {
    upcoming: sortByOccurredAtDesc(upcoming),
    past: sortByOccurredAtDesc(past),
  };
}

/**
 * Aggregates chronological Timeline items from existing domain services.
 * Meetings, tasks, and task activity — no new repositories.
 */
export async function aggregateTimelineFeed(
  query: TimelineAggregationQuery,
): Promise<TimelineAggregationResult> {
  const [tasks, activities, projects, clients, vendors, meetings] =
    await Promise.all([
      listTasks({
        workspaceId: query.workspaceId,
        companyId: query.companyId,
      }),
      listTaskActivities({
        workspaceId: query.workspaceId,
        companyId: query.companyId,
        limit: 100,
      }),
      listProjectsByCompany(query.workspaceId, query.companyId),
      listClientsByCompany(query.workspaceId, query.companyId),
      listVendorsByCompany(query.workspaceId, query.companyId),
      listMeetingsByCompany(query.workspaceId, query.companyId),
    ]);

  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );
  const clientNames = new Map(
    clients.map((client) => [client.id, client.name]),
  );
  const vendorNames = new Map(
    vendors.map((vendor) => [vendor.id, vendor.name]),
  );

  const items: TimelineFeedItem[] = [];

  for (const meeting of meetings) {
    if (meeting.status === "cancelled") continue;
    items.push({
      id: `meeting:${meeting.id}`,
      kind: "meeting",
      title: meeting.title,
      entityLabel: "Meeting",
      status: meeting.status,
      occurredAt: meeting.starts_at,
      relatedProjectId: meeting.project_id,
      relatedProjectName: meeting.project_id
        ? (projectNames.get(meeting.project_id) ?? null)
        : null,
      relatedClientId: meeting.client_id,
      relatedClientName: meeting.client_id
        ? (clientNames.get(meeting.client_id) ?? null)
        : null,
      relatedVendorId: meeting.vendor_ids[0] ?? null,
      relatedVendorName: meeting.vendor_ids[0]
        ? (vendorNames.get(meeting.vendor_ids[0]) ?? null)
        : null,
      href: buildWorkspaceOverviewHref("meeting", meeting.id),
    });
  }

  for (const task of tasks) {
    items.push({
      id: `task:${task.id}`,
      kind: "task",
      title: task.title,
      entityLabel: "Task",
      status: task.status,
      occurredAt: task.dueDate
        ? `${task.dueDate}T12:00:00.000Z`
        : task.createdAt,
      relatedProjectId: task.relatedProjectId,
      relatedProjectName: task.relatedProjectId
        ? (projectNames.get(task.relatedProjectId) ?? null)
        : null,
      relatedClientId: task.relatedClientId,
      relatedClientName: task.relatedClientId
        ? (clientNames.get(task.relatedClientId) ?? null)
        : null,
      relatedVendorId: task.relatedVendorId,
      relatedVendorName: task.relatedVendorId
        ? (vendorNames.get(task.relatedVendorId) ?? null)
        : null,
      href: buildTaskWorkspaceTabHref(TASK_WORKSPACE_HUB_ID, "tasks", {
        taskId: task.id,
      }),
    });
  }

  for (const activity of activities) {
    items.push({
      id: `task_activity:${activity.id}`,
      kind: "task_activity",
      title: activity.message,
      entityLabel: "Task activity",
      status: activity.activityType,
      occurredAt: activity.createdAt,
      relatedProjectId: null,
      relatedProjectName: null,
      relatedClientId: null,
      relatedClientName: null,
      relatedVendorId: null,
      relatedVendorName: null,
      href: activity.taskId
        ? buildTaskWorkspaceTabHref(TASK_WORKSPACE_HUB_ID, "tasks", {
            taskId: activity.taskId,
          })
        : buildTaskWorkspaceTabHref(TASK_WORKSPACE_HUB_ID, "activity", {
            explicitOverview: true,
          }),
    });
  }

  // Future Events — placeholder slot (no items until Event persistence).
  const all = sortByOccurredAtDesc(items);
  const nowIso = new Date().toISOString();
  const { upcoming, past } = splitUpcomingPast(all, nowIso);

  return {
    items: all,
    upcoming,
    past,
  };
}
