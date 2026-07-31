/**
 * Single entity → PlatformEvent deriver (Project 088).
 * All engines consume via Event Bus channels — no peer engine imports.
 */

import type { Meeting } from "@/core/meeting/types";
import { publishPlatformEvent } from "@/core/platform-events/publish";
import type { PlatformEvent } from "@/core/platform-events/types";
import type { TaskActivity } from "@/core/task/activity-types";
import type { Task } from "@/core/task/types";
import type { TimelineMilestoneProjection } from "@/core/timeline/projections";
import type { Client, Project, Vendor } from "@/core/types";
import { uiZh } from "@/config/ui-zh";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

const HISTORY = ["activity", "audit", "workflow"] as const;
const ATTENTION = ["notification", "ai_brief", "workflow"] as const;
const HISTORY_ATTENTION = [
  "activity",
  "notification",
  "ai_brief",
  "workflow",
  "audit",
] as const;

export type DerivePlatformEventsInput = {
  companyId: string;
  workspaceId: string;
  /** Notification / AI brief recipient (task assignment matching). */
  recipientId?: string | null;
  now?: Date;
  projects?: readonly Project[];
  clients?: readonly Client[];
  vendors?: readonly Vendor[];
  meetings?: readonly Meeting[];
  tasks?: readonly Task[];
  taskActivities?: readonly TaskActivity[];
  /** Neutral milestone projections — supplied by orchestrator, not Timeline Engine import. */
  milestones?: readonly TimelineMilestoneProjection[];
  includePlaceholders?: boolean;
};

function todayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sameInstant(a: string, b: string) {
  return a.slice(0, 19) === b.slice(0, 19);
}

function fromProjects(
  projects: readonly Project[],
  companyId: string,
  workspaceId: string,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  for (const project of projects) {
    if (project.company_id !== companyId) continue;
    const href = buildWorkspaceOverviewHref("project", project.id);
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "created",
        entity: "project",
        entityId: project.id,
        title: uiZh.activityProjectCreated(project.name),
        description: project.description?.trim() || uiZh.projects,
        timestamp: project.created_at,
        actorId: project.owner_id,
        href,
        channels: HISTORY,
        salt: "created",
      }),
    );
    if (!sameInstant(project.created_at, project.updated_at)) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "updated",
          entity: "project",
          entityId: project.id,
          title: uiZh.activityProjectUpdated(project.name),
          description: uiZh.activityStatusLine(project.status),
          timestamp: project.updated_at,
          actorId: project.owner_id,
          href,
          channels: HISTORY,
          salt: "updated",
          metadata: { status: project.status },
        }),
      );
    }
  }
  return out;
}

function fromClients(
  clients: readonly Client[],
  companyId: string,
  workspaceId: string,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  for (const client of clients) {
    if (client.company_id !== companyId) continue;
    const href = buildWorkspaceOverviewHref("client", client.id);
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "created",
        entity: "client",
        entityId: client.id,
        title: uiZh.activityClientCreated(client.name),
        description: client.email?.trim() || uiZh.clients,
        timestamp: client.created_at,
        actorId: client.owner_id,
        href,
        channels: HISTORY,
        salt: "created",
      }),
    );
    if (!sameInstant(client.created_at, client.updated_at)) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "updated",
          entity: "client",
          entityId: client.id,
          title: uiZh.activityClientUpdated(client.name),
          description: uiZh.activityStatusLine(client.status),
          timestamp: client.updated_at,
          actorId: client.owner_id,
          href,
          channels: HISTORY,
          salt: "updated",
        }),
      );
    }
  }
  return out;
}

function fromVendors(
  vendors: readonly Vendor[],
  companyId: string,
  workspaceId: string,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  for (const vendor of vendors) {
    if (vendor.company_id !== companyId) continue;
    const href = buildWorkspaceOverviewHref("vendor", vendor.id);
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "created",
        entity: "vendor",
        entityId: vendor.id,
        title: uiZh.activityVendorCreated(vendor.name),
        description:
          vendor.category != null ? String(vendor.category) : uiZh.vendors,
        timestamp: vendor.created_at,
        actorId: vendor.owner_id,
        href,
        channels: HISTORY,
        salt: "created",
      }),
    );
    if (!sameInstant(vendor.created_at, vendor.updated_at)) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "updated",
          entity: "vendor",
          entityId: vendor.id,
          title: uiZh.activityVendorUpdated(vendor.name),
          description: uiZh.activityStatusLine(vendor.status),
          timestamp: vendor.updated_at,
          actorId: vendor.owner_id,
          href,
          channels: HISTORY,
          salt: "updated",
        }),
      );
    }
  }
  return out;
}

function fromMeetings(
  meetings: readonly Meeting[],
  companyId: string,
  workspaceId: string,
  now: Date,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  const today = todayKey(now);

  for (const meeting of meetings) {
    if (meeting.company_id !== companyId) continue;
    const href = buildWorkspaceOverviewHref("meeting", meeting.id);

    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "scheduled",
        entity: "meeting",
        entityId: meeting.id,
        title: uiZh.activityMeetingScheduled(meeting.title),
        description: meeting.starts_at,
        timestamp: meeting.created_at,
        actorId: meeting.owner_id ?? meeting.created_by,
        href,
        channels: HISTORY,
        salt: "scheduled",
      }),
    );

    if (!sameInstant(meeting.created_at, meeting.updated_at)) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "updated",
          entity: "meeting",
          entityId: meeting.id,
          title: uiZh.activityMeetingUpdated(meeting.title),
          description: uiZh.activityStatusLine(meeting.status),
          timestamp: meeting.updated_at,
          actorId: meeting.owner_id ?? meeting.created_by,
          href,
          channels: HISTORY_ATTENTION,
          salt: "updated",
          metadata: { kind: "meeting_updated", status: meeting.status },
        }),
      );
    }

    if (meeting.status === "cancelled") continue;
    const startDay = meeting.starts_at.slice(0, 10);
    if (startDay === today || startDay === todayKey(new Date(now.getTime() + 86400000))) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "reminder",
          entity: "meeting",
          entityId: meeting.id,
          title: uiZh.notifMeetingReminderTitle,
          description: uiZh.notifMeetingReminderDesc(meeting.title),
          timestamp: meeting.starts_at,
          actorId: meeting.owner_id,
          href,
          channels: ATTENTION,
          salt: "reminder",
          metadata: { kind: "meeting_reminder" },
        }),
      );
    }
  }
  return out;
}

function fromTasks(
  tasks: readonly Task[],
  companyId: string,
  workspaceId: string,
  recipientId: string | null | undefined,
  now: Date,
  coveredTaskIds: ReadonlySet<string>,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  const today = todayKey(now);

  for (const task of tasks) {
    if (task.companyId !== companyId) continue;
    if (task.archivedAt) continue;
    const href = buildWorkspaceOverviewHref("task", task.id);

    if (!coveredTaskIds.has(task.id)) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "created",
          entity: "task",
          entityId: task.id,
          title: uiZh.activityTaskCreated(task.title),
          description: task.description?.trim() || uiZh.tasks,
          timestamp: task.createdAt,
          actorId: task.createdBy,
          href,
          channels: HISTORY,
          salt: "created",
        }),
      );
      if (task.assigneeId) {
        out.push(
          publishPlatformEvent({
            companyId,
            workspaceId,
            name: "assigned",
            entity: "task",
            entityId: task.id,
            title: uiZh.activityTaskAssigned(task.title),
            description: uiZh.activityStatusLine(task.status),
            timestamp: task.updatedAt,
            actorId: task.ownerId ?? task.createdBy,
            href,
            channels: HISTORY,
            salt: `assigned|${task.assigneeId}`,
          }),
        );
      }
      if (task.status === "completed" && task.completedDate) {
        out.push(
          publishPlatformEvent({
            companyId,
            workspaceId,
            name: "completed",
            entity: "task",
            entityId: task.id,
            title: uiZh.activityTaskCompleted(task.title),
            description: task.completedDate,
            timestamp: `${task.completedDate}T12:00:00.000Z`,
            actorId: task.assigneeId ?? task.ownerId,
            href,
            channels: HISTORY,
            salt: "completed",
          }),
        );
      } else if (!sameInstant(task.createdAt, task.updatedAt)) {
        out.push(
          publishPlatformEvent({
            companyId,
            workspaceId,
            name: "updated",
            entity: "task",
            entityId: task.id,
            title: uiZh.activityTaskUpdated(task.title),
            description: uiZh.activityStatusLine(task.status),
            timestamp: task.updatedAt,
            actorId: task.ownerId ?? task.createdBy,
            href,
            channels: HISTORY,
            salt: "updated",
          }),
        );
      }
    }

    if (
      task.status === "completed" ||
      task.status === "cancelled" ||
      task.archivedAt
    ) {
      continue;
    }

    if (recipientId && task.assigneeId === recipientId) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "assigned",
          entity: "task",
          entityId: task.id,
          title: uiZh.notifTaskAssignedTitle,
          description: uiZh.notifTaskAssignedDesc(task.title),
          timestamp: task.updatedAt || task.createdAt,
          actorId: task.ownerId,
          href,
          channels: ATTENTION,
          salt: `notif-assigned|${recipientId}`,
          metadata: { kind: "task_assigned", priority: "high" },
        }),
      );
    }

    if (task.dueDate === today) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "due_today",
          entity: "task",
          entityId: task.id,
          title: uiZh.notifTaskDueTodayTitle,
          description: uiZh.notifTaskDueTodayDesc(task.title),
          timestamp: `${today}T08:00:00.000Z`,
          actorId: task.assigneeId ?? task.ownerId,
          href,
          channels: ATTENTION,
          salt: "due_today",
          metadata: { kind: "task_due_today", priority: "high" },
        }),
      );
    }

    if (task.dueDate && task.dueDate < today) {
      out.push(
        publishPlatformEvent({
          companyId,
          workspaceId,
          name: "overdue",
          entity: "task",
          entityId: task.id,
          title: uiZh.notifTaskOverdueTitle,
          description: uiZh.notifTaskOverdueDesc(task.title),
          timestamp: `${task.dueDate}T23:59:00.000Z`,
          actorId: task.assigneeId ?? task.ownerId,
          href,
          channels: ATTENTION,
          salt: "overdue",
          metadata: { kind: "task_overdue", priority: "urgent" },
        }),
      );
    }
  }
  return out;
}

function fromTaskActivities(
  rows: readonly TaskActivity[],
  companyId: string,
  workspaceId: string,
): PlatformEvent[] {
  return rows
    .filter((row) => row.companyId === companyId && row.taskId)
    .map((row) =>
      publishPlatformEvent({
        companyId,
        workspaceId,
        name:
          row.activityType === "status_changed"
            ? "status_changed"
            : row.activityType === "task_created"
              ? "created"
              : "updated",
        entity: "task",
        entityId: row.taskId!,
        title: row.message,
        description: row.activityType,
        timestamp: row.createdAt,
        actorId: row.actorId,
        href: buildWorkspaceOverviewHref("task", row.taskId!),
        channels: HISTORY,
        salt: `task-activity|${row.id}`,
      }),
    );
}

function fromMilestones(
  milestones: readonly TimelineMilestoneProjection[],
  companyId: string,
  workspaceId: string,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  for (const milestone of milestones) {
    if (milestone.companyId !== companyId) continue;
    if (milestone.status !== "completed" && milestone.status !== "active") {
      continue;
    }
    const timestamp =
      milestone.date != null
        ? `${milestone.date}T09:00:00.000Z`
        : new Date().toISOString();
    const completed = milestone.status === "completed";
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: completed ? "milestone_completed" : "milestone_active",
        entity: "timeline",
        entityId: milestone.id,
        title: completed
          ? uiZh.activityMilestoneCompleted(
              milestone.title,
              milestone.projectName,
            )
          : uiZh.activityMilestoneActive(
              milestone.title,
              milestone.projectName,
            ),
        description: milestone.description?.trim() || uiZh.timeline,
        timestamp,
        actorId: milestone.ownerId,
        actorLabel: milestone.ownerName,
        href: `/dashboard/projects/${milestone.projectId}`,
        channels: HISTORY,
        salt: `milestone|${milestone.status}`,
        metadata: {
          projectId: milestone.projectId,
          status: milestone.status,
          date: milestone.date,
        },
      }),
    );
  }
  return out;
}

function fromCrmCreateAttention(
  clients: readonly Client[],
  vendors: readonly Vendor[],
  projects: readonly Project[],
  companyId: string,
  workspaceId: string,
  now: Date,
): PlatformEvent[] {
  const out: PlatformEvent[] = [];
  const cutoff = now.getTime() - 14 * 86400000;

  for (const client of clients) {
    if (client.company_id !== companyId) continue;
    if (new Date(client.created_at).getTime() < cutoff) continue;
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "created",
        entity: "client",
        entityId: client.id,
        title: uiZh.notifClientCreatedTitle,
        description: uiZh.notifClientCreatedDesc(client.name),
        timestamp: client.created_at,
        actorId: client.owner_id,
        href: buildWorkspaceOverviewHref("client", client.id),
        channels: ATTENTION,
        salt: "notif-created",
        metadata: { kind: "client_created" },
      }),
    );
  }

  for (const vendor of vendors) {
    if (vendor.company_id !== companyId) continue;
    if (new Date(vendor.created_at).getTime() < cutoff) continue;
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "assigned",
        entity: "vendor",
        entityId: vendor.id,
        title: uiZh.notifVendorAssignedTitle,
        description: uiZh.notifVendorAssignedDesc(vendor.name),
        timestamp: vendor.created_at,
        actorId: vendor.owner_id,
        href: buildWorkspaceOverviewHref("vendor", vendor.id),
        channels: ATTENTION,
        salt: "notif-assigned",
        metadata: { kind: "vendor_assigned" },
      }),
    );
  }

  for (const project of projects) {
    if (project.company_id !== companyId) continue;
    if (new Date(project.updated_at).getTime() < cutoff) continue;
    if (sameInstant(project.created_at, project.updated_at)) continue;
    out.push(
      publishPlatformEvent({
        companyId,
        workspaceId,
        name: "updated",
        entity: "project",
        entityId: project.id,
        title: uiZh.notifProjectUpdatedTitle,
        description: uiZh.notifProjectUpdatedDesc(project.name),
        timestamp: project.updated_at,
        actorId: project.owner_id,
        href: buildWorkspaceOverviewHref("project", project.id),
        channels: ATTENTION,
        salt: "notif-updated",
        metadata: { kind: "project_updated" },
      }),
    );
  }

  return out;
}

function placeholders(
  companyId: string,
  workspaceId: string,
  now: Date,
): PlatformEvent[] {
  const stamp = now.toISOString();
  return (
    [
      ["finance", uiZh.activityFinancePlaceholder, uiZh.notifInvoicePlaceholderTitle],
      ["documents", uiZh.activityDocumentsPlaceholder, uiZh.notifDocumentsPlaceholderTitle],
      ["calendar", uiZh.activityCalendarPlaceholder, uiZh.notifCalendarPlaceholderTitle],
    ] as const
  ).map(([entity, activityTitle, notifTitle]) =>
    publishPlatformEvent({
      companyId,
      workspaceId,
      name: "placeholder",
      entity,
      entityId: `future:${entity}`,
      title: notifTitle || activityTitle,
      description: uiZh.comingSoon,
      timestamp: stamp,
      channels: ["activity", "notification"],
      salt: "placeholder",
      metadata: { kind: entity === "finance" ? "invoice" : entity },
    }),
  );
}

/**
 * Derive the company-scoped platform event stream.
 * Callers must only pass entities the user is allowed to see.
 */
export function derivePlatformEvents(
  input: DerivePlatformEventsInput,
): PlatformEvent[] {
  const {
    companyId,
    workspaceId,
    recipientId = null,
    now = new Date(),
    projects = [],
    clients = [],
    vendors = [],
    meetings = [],
    tasks = [],
    taskActivities = [],
    milestones = [],
    includePlaceholders = false,
  } = input;

  const coveredTaskIds = new Set(
    taskActivities
      .map((row) => row.taskId)
      .filter((id): id is string => typeof id === "string" && id.length > 0),
  );

  const events: PlatformEvent[] = [
    ...fromProjects(projects, companyId, workspaceId),
    ...fromClients(clients, companyId, workspaceId),
    ...fromVendors(vendors, companyId, workspaceId),
    ...fromMeetings(meetings, companyId, workspaceId, now),
    ...fromTasks(tasks, companyId, workspaceId, recipientId, now, coveredTaskIds),
    ...fromTaskActivities(taskActivities, companyId, workspaceId),
    ...fromMilestones(milestones, companyId, workspaceId),
    ...fromCrmCreateAttention(
      clients,
      vendors,
      projects,
      companyId,
      workspaceId,
      now,
    ),
  ];

  if (includePlaceholders) {
    events.push(...placeholders(companyId, workspaceId, now));
  }

  return events
    .filter((e) => e.companyId === companyId && e.workspaceId === workspaceId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
