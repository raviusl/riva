/**
 * Shared Task domain types — Project 055 Task CRM.
 */

import type { TaskPriority, TaskStatus } from "@/core/task/constants";

export type { TaskPriority, TaskStatus } from "@/core/task/constants";

export type TaskId = string;

export type TaskAssignmentRole = "owner" | "assignee";

/**
 * Core Task entity shared across Project, Meeting, Client, and Vendor workspaces.
 */
export type Task = {
  id: TaskId;
  workspaceId: string;
  companyId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  ownerId: string | null;
  assigneeId: string | null;
  followers: string[];
  relatedProjectId: string | null;
  relatedClientId: string | null;
  relatedVendorId: string | null;
  relatedMeetingId: string | null;
  tags: string[];
  archivedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskModel = Task;
