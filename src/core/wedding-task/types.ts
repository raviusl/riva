/**
 * Project 100 — Wedding Project Task types.
 */

import type {
  WeddingTaskPriority,
  WeddingTaskStatus,
} from "@/core/wedding-task/constants";

export type WeddingTaskAttachment = {
  id: string;
  name: string;
  url: string | null;
  mimeType: string | null;
};

export type WeddingTaskComment = {
  id: string;
  body: string;
  authorLabel: string;
  authorId?: string | null;
  createdAt: string;
};

export type WeddingTaskActivity = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  actorId?: string | null;
  actorLabel?: string | null;
};

export type WeddingProjectTask = {
  id: string;
  workspace_id: string;
  company_id: string;
  project_id: string;
  sequence: number;
  title: string;
  description: string | null;
  status: WeddingTaskStatus;
  priority: WeddingTaskPriority;
  due_date: string | null;
  start_date: string | null;
  completed_at: string | null;
  reminder_minutes: number | null;
  assignee_label: string | null;
  assignee_person_id: string | null;
  client_id: string | null;
  vendor_id: string | null;
  coordinator_label: string | null;
  package_label: string | null;
  tags: string[];
  attachments: WeddingTaskAttachment[];
  comments: WeddingTaskComment[];
  activity_log: WeddingTaskActivity[];
  internal_notes: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
