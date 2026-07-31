"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  assignTaskAction,
  createTaskAction,
  deleteTaskAction,
  unassignTaskAction,
  updateTaskAction,
} from "@/core/actions/task-actions";
import type { TaskAssignmentRole } from "@/core/task";
import { TaskWorkspaceDetailPanel } from "@/features/task/components/task-workspace-detail-panel";
import {
  TaskWorkspaceForm,
  emptyToNull,
  parseFollowerIds,
  parseTagList,
  type TaskFormValues,
} from "@/features/task/components/task-workspace-form";
import type {
  TaskAssignableMember,
  TaskWorkspaceItem,
} from "@/features/task/lib/task-types";
import {
  formatTaskDate,
  taskPriorityLabel,
  taskStatusLabel,
} from "@/features/task/lib/task-labels";
import { toTaskWorkspaceItem } from "@/features/task/lib/task-workspace-map";
import { buildTaskWorkspaceTabHref } from "@/features/task/lib/task-workspace-tabs";
import { cn } from "@/lib/utils";
import { uiZh } from "@/config/ui-zh";

type PanelMode = "view" | "create" | "edit";

type TaskWorkspaceTasksPanelProps = {
  hubId: string;
  workspaceId: string;
  companyId: string;
  canWrite: boolean;
  canAssign: boolean;
  canComplete?: boolean;
  tasks: TaskWorkspaceItem[];
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; name: string }>;
  meetings?: Array<{ id: string; name: string }>;
  members: TaskAssignableMember[];
  initialTaskId?: string | null;
  createRequestKey?: number;
  onTasksChange: (tasks: TaskWorkspaceItem[]) => void;
};

export function TaskWorkspaceTasksPanel({
  hubId,
  workspaceId,
  companyId,
  canWrite,
  canAssign,
  canComplete = false,
  tasks,
  projects,
  clients,
  vendors,
  meetings = [],
  members,
  initialTaskId = null,
  createRequestKey = 0,
  onTasksChange,
}: TaskWorkspaceTasksPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedFromUrl = searchParams.get("task") ?? initialTaskId;
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    selectedFromUrl,
  );
  const [mode, setMode] = useState<PanelMode>("view");

  const projectNames = useMemo(
    () => new Map(projects.map((item) => [item.id, item.name])),
    [projects],
  );
  const clientNames = useMemo(
    () => new Map(clients.map((item) => [item.id, item.name])),
    [clients],
  );
  const vendorNames = useMemo(
    () => new Map(vendors.map((item) => [item.id, item.name])),
    [vendors],
  );
  const memberNames = useMemo(
    () => new Map(members.map((item) => [item.userId, item.fullName])),
    [members],
  );

  useEffect(() => {
    if (createRequestKey > 0) {
      setMode("create");
      setSelectedTaskId(null);
    }
  }, [createRequestKey]);

  useEffect(() => {
    const fromUrl = searchParams.get("task");
    if (fromUrl) {
      setSelectedTaskId(fromUrl);
      setMode("view");
    }
  }, [searchParams]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  function selectTask(taskId: string) {
    setSelectedTaskId(taskId);
    setMode("view");
    router.replace(buildTaskWorkspaceTabHref(hubId, "tasks", { taskId }), {
      scroll: false,
    });
  }

  function clearTaskParam() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task");
    if (!params.get("tab")) {
      params.set("tab", "tasks");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  function enrich(task: Parameters<typeof toTaskWorkspaceItem>[0]) {
    return toTaskWorkspaceItem(task, {
      projectNames,
      clientNames,
      vendorNames,
      memberNames,
    });
  }

  function applyTask(task: Parameters<typeof toTaskWorkspaceItem>[0]) {
    const item = enrich(task);
    onTasksChange(tasks.map((row) => (row.id === item.id ? item : row)));
    return item;
  }

  function handleCreate(values: TaskFormValues) {
    startTransition(async () => {
      const result = await createTaskAction({
        workspaceId,
        companyId,
        title: values.title.trim(),
        description: emptyToNull(values.description),
        status: values.status,
        priority: values.priority,
        startDate: emptyToNull(values.startDate),
        dueDate: emptyToNull(values.dueDate),
        completedDate: emptyToNull(values.completedDate),
        ownerId: emptyToNull(values.ownerId),
        assigneeId: emptyToNull(values.assigneeId),
        followers: parseFollowerIds(values.followersRaw),
        relatedProjectId: emptyToNull(values.relatedProjectId),
        relatedClientId: emptyToNull(values.relatedClientId),
        relatedVendorId: emptyToNull(values.relatedVendorId),
        relatedMeetingId: emptyToNull(values.relatedMeetingId),
        tags: parseTagList(values.tagsRaw),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      const item = enrich(result.data.task);
      onTasksChange([item, ...tasks.filter((task) => task.id !== item.id)]);
      setSelectedTaskId(item.id);
      setMode("view");
      toast.success(uiZh.taskCreated);
      router.replace(
        buildTaskWorkspaceTabHref(hubId, "tasks", { taskId: item.id }),
        { scroll: false },
      );
      router.refresh();
    });
  }

  function handleEdit(values: TaskFormValues) {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await updateTaskAction({
        workspaceId,
        companyId,
        taskId: selectedTask.id,
        title: values.title.trim(),
        description: emptyToNull(values.description),
        status: values.status,
        priority: values.priority,
        startDate: emptyToNull(values.startDate),
        dueDate: emptyToNull(values.dueDate),
        completedDate: emptyToNull(values.completedDate),
        ownerId: emptyToNull(values.ownerId),
        assigneeId: emptyToNull(values.assigneeId),
        followers: parseFollowerIds(values.followersRaw),
        relatedProjectId: emptyToNull(values.relatedProjectId),
        relatedClientId: emptyToNull(values.relatedClientId),
        relatedVendorId: emptyToNull(values.relatedVendorId),
        relatedMeetingId: emptyToNull(values.relatedMeetingId),
        tags: parseTagList(values.tagsRaw),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      applyTask(result.data.task);
      setMode("view");
      toast.success(uiZh.taskUpdated);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await deleteTaskAction({
        workspaceId,
        companyId,
        taskId: selectedTask.id,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      onTasksChange(tasks.filter((task) => task.id !== selectedTask.id));
      setSelectedTaskId(null);
      setMode("view");
      clearTaskParam();
      toast.success(uiZh.taskDeleted);
      router.refresh();
    });
  }

  function handleAssign(role: TaskAssignmentRole, userId: string) {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await assignTaskAction({
        workspaceId,
        companyId,
        taskId: selectedTask.id,
        role,
        userId,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      applyTask(result.data.task);
      toast.success(role === "owner" ? uiZh.ownerAssigned : uiZh.assigneeAssigned);
      router.refresh();
    });
  }

  function handleUnassign(role: TaskAssignmentRole) {
    if (!selectedTask) return;

    startTransition(async () => {
      const result = await unassignTaskAction({
        workspaceId,
        companyId,
        taskId: selectedTask.id,
        role,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      applyTask(result.data.task);
      toast.success(role === "owner" ? uiZh.ownerRemoved : uiZh.assigneeRemoved);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">
              Tasks ({tasks.length})
            </h2>
            <p className="mt-1 text-xs text-white/45">
              Company tasks with live persistence
            </p>
          </div>
          {canWrite ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setMode("create");
                setSelectedTaskId(null);
                clearTaskParam();
              }}
            >
              New task
            </Button>
          ) : null}
        </div>

        {tasks.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noTasksYet}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {tasks.map((task) => {
              const active = task.id === selectedTaskId && mode !== "create";
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => selectTask(task.id)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-white/20 bg-white/[0.06]"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-white">{task.title}</p>
                      <span className="text-[11px] text-white/40">
                        {taskStatusLabel(task.status)}
                      </span>
                      <span className="text-[11px] text-white/35">
                        {taskPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/40">
                      Due {formatTaskDate(task.dueDate)}
                      {` · ${task.assigneeLabel ?? uiZh.unassigned}`}
                      {task.relatedProjectName
                        ? ` · ${task.relatedProjectName}`
                        : ""}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {mode === "create" && canWrite ? (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
          <h2 className="text-sm font-medium text-white">{uiZh.createTask}</h2>
          <p className="mt-1 text-xs text-white/45">
            Saved to the company task list
          </p>
          <div className="mt-5">
            <TaskWorkspaceForm
              mode="create"
              projects={projects}
              clients={clients}
              vendors={vendors}
              meetings={meetings}
              members={members}
              canAssign={canAssign}
              pending={pending}
              onCancel={() => setMode("view")}
              onSubmit={handleCreate}
            />
          </div>
        </section>
      ) : null}

      {mode === "edit" && selectedTask && canWrite ? (
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
          <h2 className="text-sm font-medium text-white">{uiZh.editTask}</h2>
          <p className="mt-1 text-xs text-white/45">{uiZh.updateAndSave}</p>
          <div className="mt-5">
            <TaskWorkspaceForm
              key={selectedTask.id}
              mode="edit"
              initial={selectedTask}
              projects={projects}
              clients={clients}
              vendors={vendors}
              meetings={meetings}
              members={members}
              canAssign={canAssign}
              pending={pending}
              onCancel={() => setMode("view")}
              onSubmit={handleEdit}
            />
          </div>
        </section>
      ) : null}

      {mode === "view" && selectedTask ? (
        <TaskWorkspaceDetailPanel
          workspaceId={workspaceId}
          companyId={companyId}
          task={selectedTask}
          members={members}
          canWrite={canWrite}
          canAssign={canAssign}
          canComplete={canComplete}
          pending={pending}
          onEdit={() => setMode("edit")}
          onDelete={handleDelete}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
          onTaskUpdated={(item) => {
            onTasksChange(
              tasks.map((task) => (task.id === item.id ? item : task)),
            );
          }}
        />
      ) : null}

      {mode === "view" && !selectedTask ? (
        <section className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
          <p className="text-sm text-white/70">{uiZh.selectATask}</p>
          <p className="mt-2 text-xs text-white/40">
            Choose a task from the list to view details
            {canWrite ? ", or create a new one." : "."}
          </p>
        </section>
      ) : null}
    </div>
  );
}
