"use client";

import {
  WorkspaceHeader,
  type WorkspaceHeaderAction,
} from "@/components/layout/workspace-header";
import type { TaskWorkspaceModel } from "@/features/task/lib/task-types";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type TaskWorkspaceHeaderProps = {
  workspace: TaskWorkspaceModel;
  openCount: number;
  onCreateTask?: () => void;
};

export function TaskWorkspaceHeader({
  workspace,
  openCount,
  onCreateTask,
}: TaskWorkspaceHeaderProps) {
  const actions: WorkspaceHeaderAction[] = onCreateTask
    ? [
        {
          key: "create-task",
          label: uiZh.newTaskBtn,
          onClick: onCreateTask,
          variant: "outline",
        },
      ]
    : [];

  return (
    <WorkspaceHeader
      eyebrow={uiZh.taskWorkspaceEyebrow}
      title={workspace.title}
      status={{
        label: `${openCount} open`,
        tone: openCount > 0 ? "info" : "success",
      }}
      lifecycle={workspace.description}
      breadcrumbs={buildWorkspaceBreadcrumbs("task")}
      actions={actions}
    />
  );
}
