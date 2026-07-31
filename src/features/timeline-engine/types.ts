/**
 * Timeline Engine view types — project-owned execution lifecycle.
 * Not a calendar. Scheduling stays in Task / Meeting domains.
 */

import type { MilestoneKind } from "@/features/timeline-engine/defaults";
import type { TimelineMilestoneStatus } from "@/features/timeline-engine/status";

export type TimelineRelatedTask = {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  href: string;
};

export type TimelineRelatedMeeting = {
  id: string;
  title: string;
  status: string;
  startsAt: string;
  href: string;
};

export type TimelineMilestoneItem = {
  id: string;
  kind: MilestoneKind;
  title: string;
  description: string | null;
  date: string | null;
  status: TimelineMilestoneStatus;
  ownerId: string | null;
  ownerName: string | null;
  sequence: number;
  relatedTasks: TimelineRelatedTask[];
  relatedMeetings: TimelineRelatedMeeting[];
};

export type ProjectTimelineEngine = {
  projectId: string;
  companyId: string;
  workspaceId: string;
  milestones: TimelineMilestoneItem[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
};
