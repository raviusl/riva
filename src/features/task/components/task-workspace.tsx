"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { TaskWorkspaceActivityPanel } from "@/features/task/components/task-workspace-activity-panel";
import { TaskWorkspaceHeader } from "@/features/task/components/task-workspace-header";
import { TaskWorkspaceOverview } from "@/features/task/components/task-workspace-overview";
import {
  TaskWorkspaceAttachmentsPanel,
  TaskWorkspaceChecklistPanel,
} from "@/features/task/components/task-workspace-placeholders";
import { TaskWorkspaceTasksPanel } from "@/features/task/components/task-workspace-tasks-panel";
import { useOpenTaskCount } from "@/features/task/components/task-workspace-form";
import type {
  TaskWorkspaceItem,
  TaskWorkspaceModel,
} from "@/features/task/lib/task-types";
import {
  DEFAULT_TASK_WORKSPACE_TAB,
  TASK_WORKSPACE_TABS,
  buildTaskWorkspaceTabHref,
  parseTaskWorkspaceTab,
  type TaskWorkspaceTabId,
} from "@/features/task/lib/task-workspace-tabs";

type TaskWorkspaceProps = {
  model: TaskWorkspaceModel;
  initialTab?: TaskWorkspaceTabId;
  initialTaskId?: string | null;
};

export function TaskWorkspace({
  model,
  initialTab = DEFAULT_TASK_WORKSPACE_TAB,
  initialTaskId = null,
}: TaskWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTaskWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const [tasks, setTasks] = useState<TaskWorkspaceItem[]>(model.tasks);
  const [createRequestKey, setCreateRequestKey] = useState(0);
  const openCount = useOpenTaskCount(tasks);

  useEffect(() => {
    setTasks(model.tasks);
  }, [model.tasks]);

  const liveModel = useMemo(
    () => ({ ...model, tasks }),
    [model, tasks],
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseTaskWorkspaceTab(tabId);
      const taskId =
        tab === "tasks" ? (searchParams.get("task") ?? undefined) : undefined;
      return buildTaskWorkspaceTabHref(model.id, tab, {
        explicitOverview: true,
        taskId,
      });
    },
    [model.id, searchParams],
  );

  function handleCreateTask() {
    if (!model.canWrite) return;
    setCreateRequestKey((key) => key + 1);
    router.push(
      buildTaskWorkspaceTabHref(model.id, "tasks", {
        explicitOverview: true,
      }),
      { scroll: false },
    );
  }

  return (
    <div className="space-y-6">
      <TaskWorkspaceHeader
        workspace={liveModel}
        openCount={openCount}
        onCreateTask={model.canWrite ? handleCreateTask : undefined}
      />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={TASK_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <TaskWorkspaceOverview workspace={liveModel} />
        ) : null}

        {activeTab === "tasks" ? (
          <TaskWorkspaceTasksPanel
            hubId={model.id}
            workspaceId={model.workspaceId}
            companyId={model.companyId}
            canWrite={model.canWrite}
            canAssign={model.canAssign}
            canComplete={model.canComplete}
            tasks={tasks}
            projects={model.projects}
            clients={model.clients}
            vendors={model.vendors}
            meetings={model.meetings}
            members={model.members}
            initialTaskId={initialTaskId}
            createRequestKey={createRequestKey}
            onTasksChange={setTasks}
          />
        ) : null}

        {activeTab === "checklist" ? <TaskWorkspaceChecklistPanel /> : null}

        {activeTab === "attachments" ? (
          <TaskWorkspaceAttachmentsPanel />
        ) : null}

        {activeTab === "activity" ? (
          <TaskWorkspaceActivityPanel activities={model.activities} />
        ) : null}
      </div>
    </div>
  );
}
