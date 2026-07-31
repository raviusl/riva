import type { Task, TaskPriority, TaskStatus } from "@/core/task";
import type { TaskActivityFeedItem } from "@/features/task/components/task-workspace-activity-panel";

export type TaskAssignableMember = {
  userId: string;
  fullName: string;
  email: string;
};

/**
 * Task row in the Task Workspace UI layer.
 * Extends the domain Task with optional display labels for related entities.
 */
export type TaskWorkspaceItem = Task & {
  relatedProjectName: string | null;
  relatedClientName: string | null;
  relatedVendorName: string | null;
  relatedMeetingName: string | null;
  ownerLabel: string | null;
  assigneeLabel: string | null;
};

/** Hub model for the Task Workspace. */
export type TaskWorkspaceModel = {
  id: string;
  title: string;
  description: string;
  workspaceId: string;
  companyId: string;
  canWrite: boolean;
  canAssign: boolean;
  canComplete: boolean;
  tasks: TaskWorkspaceItem[];
  activities: TaskActivityFeedItem[];
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; name: string }>;
  meetings: Array<{ id: string; name: string }>;
  members: TaskAssignableMember[];
};

export const TASK_WORKSPACE_HUB_ID = "workspace";

export type { TaskPriority, TaskStatus };
