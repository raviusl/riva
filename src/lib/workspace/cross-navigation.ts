import type { WorkspaceHeaderBreadcrumb } from "@/components/layout/workspace-header";
import {
  buildAutomationWorkspaceTabHref,
  type AutomationWorkspaceTabId,
} from "@/features/automation/lib/automation-workspace-tabs";
import {
  buildClientWorkspaceTabHref,
  type ClientWorkspaceTabId,
} from "@/features/client/lib/client-workspace-tabs";
import {
  buildDocumentWorkspaceTabHref,
  type DocumentWorkspaceTabId,
} from "@/features/document/lib/document-workspace-tabs";
import {
  buildFinanceWorkspaceTabHref,
  type FinanceWorkspaceTabId,
} from "@/features/finance/lib/finance-workspace-tabs";
import {
  buildMeetingWorkspaceTabHref,
  type MeetingWorkspaceTabId,
} from "@/features/meeting/lib/meeting-workspace-tabs";
import {
  buildNotificationWorkspaceTabHref,
  type NotificationWorkspaceTabId,
} from "@/features/notification/lib/notification-workspace-tabs";
import {
  buildProjectWorkspaceTabHref,
  type ProjectWorkspaceTabId,
} from "@/features/project/lib/project-workspace-tabs";
import {
  buildTaskWorkspaceTabHref,
  type TaskWorkspaceTabId,
} from "@/features/task/lib/task-workspace-tabs";
import {
  buildTimelineWorkspaceTabHref,
  type TimelineWorkspaceTabId,
} from "@/features/timeline/lib/timeline-workspace-tabs";
import {
  buildVendorWorkspaceTabHref,
  type VendorWorkspaceTabId,
} from "@/features/vendor/lib/vendor-workspace-tabs";

export type WorkspaceKind =
  | "project"
  | "client"
  | "vendor"
  | "meeting"
  | "task"
  | "timeline"
  | "document"
  | "finance"
  | "notification"
  | "automation";

const LIST_PATHS: Record<WorkspaceKind, string> = {
  project: "/dashboard/projects",
  client: "/dashboard/clients",
  vendor: "/dashboard/vendors",
  meeting: "/dashboard/meetings",
  task: "/dashboard/tasks",
  timeline: "/dashboard/timeline",
  document: "/dashboard/documents",
  finance: "/dashboard/finance",
  notification: "/dashboard/notifications",
  automation: "/dashboard/automations",
};

const LIST_LABELS: Record<WorkspaceKind, string> = {
  project: "Projects",
  client: "Clients",
  vendor: "Vendors",
  meeting: "Meetings",
  task: "Tasks",
  timeline: "Timeline",
  document: "Documents",
  finance: "Finance",
  notification: "Notifications",
  automation: "Automations",
};

const WORKSPACE_LABELS: Record<WorkspaceKind, string> = {
  project: "Project Workspace",
  client: "Client Workspace",
  vendor: "Vendor Workspace",
  meeting: "Meeting Workspace",
  task: "Task Workspace",
  timeline: "Timeline Workspace",
  document: "Document Workspace",
  finance: "Finance Workspace",
  notification: "Notification Workspace",
  automation: "Automation Workspace",
};

/** Deep-link into a workspace overview (history-safe Link href). */
export function buildWorkspaceOverviewHref(
  kind: WorkspaceKind,
  id: string,
): string {
  switch (kind) {
    case "project":
      return buildProjectWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "client":
      return buildClientWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "vendor":
      return buildVendorWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "meeting":
      return buildMeetingWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "task":
      return buildTaskWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "timeline":
      return buildTimelineWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "document":
      return buildDocumentWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "finance":
      return buildFinanceWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "notification":
      return buildNotificationWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
    case "automation":
      return buildAutomationWorkspaceTabHref(id, "overview", {
        explicitOverview: true,
      });
  }
}

export function buildWorkspaceTabHref(
  kind: WorkspaceKind,
  id: string,
  tab: string,
): string {
  switch (kind) {
    case "project":
      return buildProjectWorkspaceTabHref(id, tab as ProjectWorkspaceTabId, {
        explicitOverview: true,
      });
    case "client":
      return buildClientWorkspaceTabHref(id, tab as ClientWorkspaceTabId, {
        explicitOverview: true,
      });
    case "vendor":
      return buildVendorWorkspaceTabHref(id, tab as VendorWorkspaceTabId, {
        explicitOverview: true,
      });
    case "meeting":
      return buildMeetingWorkspaceTabHref(id, tab as MeetingWorkspaceTabId, {
        explicitOverview: true,
      });
    case "task":
      return buildTaskWorkspaceTabHref(id, tab as TaskWorkspaceTabId, {
        explicitOverview: true,
      });
    case "timeline":
      return buildTimelineWorkspaceTabHref(id, tab as TimelineWorkspaceTabId, {
        explicitOverview: true,
      });
    case "document":
      return buildDocumentWorkspaceTabHref(id, tab as DocumentWorkspaceTabId, {
        explicitOverview: true,
      });
    case "finance":
      return buildFinanceWorkspaceTabHref(id, tab as FinanceWorkspaceTabId, {
        explicitOverview: true,
      });
    case "notification":
      return buildNotificationWorkspaceTabHref(
        id,
        tab as NotificationWorkspaceTabId,
        { explicitOverview: true },
      );
    case "automation":
      return buildAutomationWorkspaceTabHref(
        id,
        tab as AutomationWorkspaceTabId,
        { explicitOverview: true },
      );
  }
}

/**
 * Consistent workspace breadcrumb trail:
 * Dashboard → list → Workspace
 */
export function buildWorkspaceBreadcrumbs(
  kind: WorkspaceKind,
): WorkspaceHeaderBreadcrumb[] {
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label: LIST_LABELS[kind], href: LIST_PATHS[kind] },
    { label: WORKSPACE_LABELS[kind] },
  ];
}

export function workspaceListPath(kind: WorkspaceKind): string {
  return LIST_PATHS[kind];
}

export function workspaceKindLabel(kind: WorkspaceKind): string {
  return WORKSPACE_LABELS[kind];
}
