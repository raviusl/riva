"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  archiveTaskAction,
  completeTaskAction,
  restoreTaskAction,
} from "@/core/actions/task-actions";
import type { Task } from "@/core/task";
import {
  formatTaskDate,
  taskPriorityLabel,
  taskStatusLabel,
} from "@/features/task/lib/task-labels";
import { TASK_WORKSPACE_HUB_ID } from "@/features/task/lib/task-types";
import { buildTaskWorkspaceTabHref } from "@/features/task/lib/task-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type TaskListItemProps = {
  workspaceId: string;
  companyId: string;
  task: Task;
  canWrite: boolean;
  canComplete: boolean;
  projectName?: string | null;
  ownerName?: string | null;
};

export function TaskListItem({
  workspaceId,
  companyId,
  task,
  canWrite,
  canComplete,
  projectName = null,
  ownerName = null,
}: TaskListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const detailHref = buildWorkspaceOverviewHref("task", task.id);
  const hubHref = buildTaskWorkspaceTabHref(TASK_WORKSPACE_HUB_ID, "tasks", {
    taskId: task.id,
  });

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={detailHref}
            className="truncate text-sm font-medium text-white hover:text-white/80"
          >
            {task.title}
          </Link>
          <p className="mt-1 truncate text-xs text-white/45">
            {taskStatusLabel(task.status)} · {taskPriorityLabel(task.priority)}
            {ownerName ? ` · ${ownerName}` : ""}
            {task.dueDate ? ` · Due ${formatTaskDate(task.dueDate)}` : ""}
            {projectName ? ` · ${projectName}` : ""}
          </p>
          {task.tags.length > 0 ? (
            <p className="mt-1 truncate text-xs text-white/35">
              {task.tags.join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => router.push(detailHref)}
          >
            Open
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => router.push(hubHref)}
          >
            Workspace
          </Button>
          {canWrite && !task.archivedAt ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}
            >
              Edit
            </Button>
          ) : null}
          {canComplete &&
          !task.archivedAt &&
          task.status !== "completed" &&
          task.status !== "cancelled" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await completeTaskAction({
                    workspaceId,
                    companyId,
                    taskId: task.id,
                  });
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(uiZh.taskCompletedToast);
                  router.refresh();
                });
              }}
            >
              Complete
            </Button>
          ) : null}
          {canWrite ? (
            task.archivedAt ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await restoreTaskAction({
                      workspaceId,
                      companyId,
                      taskId: task.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(uiZh.taskRestoredToast);
                    router.refresh();
                  });
                }}
              >
                Restore
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await archiveTaskAction({
                      workspaceId,
                      companyId,
                      taskId: task.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(uiZh.taskArchivedToast);
                    router.refresh();
                  });
                }}
              >
                Archive
              </Button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
