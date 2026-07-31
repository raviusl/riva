"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import {
  WorkspaceHeader,
} from "@/components/layout/workspace-header";
import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import type { AuditRecord } from "@/core/audit";
import {
  assignTaskAction,
  deleteTaskAction,
  unassignTaskAction,
} from "@/core/actions/task-actions";
import type { TaskAssignmentRole } from "@/core/task";
import { MeetingWorkspaceActivityPanel } from "@/features/meeting/components/meeting-workspace-activity-panel";
import { TaskWorkspaceDetailPanel } from "@/features/task/components/task-workspace-detail-panel";
import {
  taskStatusLabel,
  taskStatusTone,
} from "@/features/task/lib/task-labels";
import type {
  TaskAssignableMember,
  TaskWorkspaceItem,
} from "@/features/task/lib/task-types";
import { toTaskWorkspaceItem } from "@/features/task/lib/task-workspace-map";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

const DETAIL_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "checklist", label: uiZh.checklist },
  { id: "attachments", label: uiZh.attachments },
  { id: "activity", label: uiZh.activity },
] as const;

type DetailTabId = (typeof DETAIL_TABS)[number]["id"];

type TaskDetailWorkspaceProps = {
  workspaceId: string;
  companyId: string;
  task: TaskWorkspaceItem;
  members: TaskAssignableMember[];
  activity: AuditRecord[];
  canWrite: boolean;
  canAssign: boolean;
  canComplete: boolean;
  initialTab?: string;
};

function parseDetailTab(value: string | null | undefined): DetailTabId {
  return DETAIL_TABS.some((tab) => tab.id === value)
    ? (value as DetailTabId)
    : "overview";
}

export function TaskDetailWorkspace({
  workspaceId,
  companyId,
  task: initialTask,
  members,
  activity,
  canWrite,
  canAssign,
  canComplete,
  initialTab = "overview",
}: TaskDetailWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [task, setTask] = useState(initialTask);
  const activeTab = parseDetailTab(searchParams.get("tab") ?? initialTab);

  const hrefForTab = useCallback(
    (tabId: string) => {
      const base = `/dashboard/tasks/${task.id}`;
      if (tabId === "overview") return base;
      return `${base}?tab=${tabId}`;
    },
    [task.id],
  );

  function handleAssign(role: TaskAssignmentRole, userId: string) {
    startTransition(async () => {
      const result = await assignTaskAction({
        workspaceId,
        companyId,
        taskId: task.id,
        role,
        userId,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTask(
        toTaskWorkspaceItem(result.data.task, {
          memberNames: new Map(
            members.map((member) => [member.userId, member.fullName]),
          ),
        }),
      );
      toast.success(role === "owner" ? uiZh.ownerAssigned : uiZh.assigneeAssigned);
      router.refresh();
    });
  }

  function handleUnassign(role: TaskAssignmentRole) {
    startTransition(async () => {
      const result = await unassignTaskAction({
        workspaceId,
        companyId,
        taskId: task.id,
        role,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTask(
        toTaskWorkspaceItem(result.data.task, {
          memberNames: new Map(
            members.map((member) => [member.userId, member.fullName]),
          ),
        }),
      );
      toast.success(role === "owner" ? uiZh.ownerRemoved : uiZh.assigneeRemoved);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTaskAction({
        workspaceId,
        companyId,
        taskId: task.id,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(uiZh.taskDeleted);
      router.push("/dashboard/tasks");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        eyebrow={uiZh.taskWorkspaceEyebrow}
        title={task.title}
        status={{
          label: taskStatusLabel(task.status),
          tone: taskStatusTone(task.status),
        }}
        lifecycle={task.archivedAt ? uiZh.archived : undefined}
        breadcrumbs={buildWorkspaceBreadcrumbs("task")}
      />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={DETAIL_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <TaskWorkspaceDetailPanel
            workspaceId={workspaceId}
            companyId={companyId}
            task={task}
            members={members}
            canWrite={canWrite}
            canAssign={canAssign}
            canComplete={canComplete}
            pending={pending}
            onEdit={() => router.push(`/dashboard/tasks/${task.id}/edit`)}
            onDelete={handleDelete}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
            onTaskUpdated={setTask}
          />
        ) : null}

        {activeTab === "checklist" ? (
          <WorkspaceComingSoon
            title={uiZh.checklist}
            description={uiZh.checklistSoonDesc}
          />
        ) : null}

        {activeTab === "attachments" ? (
          <WorkspaceComingSoon
            title={uiZh.attachments}
            description={uiZh.attachmentsSoonDesc}
          />
        ) : null}

        {activeTab === "activity" ? (
          <MeetingWorkspaceActivityPanel records={activity} />
        ) : null}
      </div>
    </div>
  );
}
