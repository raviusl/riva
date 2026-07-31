"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  archiveTaskAction,
  completeTaskAction,
  restoreTaskAction,
} from "@/core/actions/task-actions";
import type { Task, TaskAssignmentRole } from "@/core/task";
import { TaskPersonDisplay } from "@/features/task/components/task-person-display";
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
import { uiZh } from "@/config/ui-zh";

type TaskWorkspaceDetailPanelProps = {
  workspaceId: string;
  companyId: string;
  task: TaskWorkspaceItem;
  members: TaskAssignableMember[];
  canWrite: boolean;
  canAssign: boolean;
  canComplete?: boolean;
  pending?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: (role: TaskAssignmentRole, userId: string) => void;
  onUnassign: (role: TaskAssignmentRole) => void;
  onTaskUpdated?: (task: TaskWorkspaceItem) => void;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[120px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="break-words text-sm text-white/80">{value}</dd>
    </div>
  );
}

export function TaskWorkspaceDetailPanel({
  workspaceId,
  companyId,
  task,
  members,
  canWrite,
  canAssign,
  canComplete = false,
  pending = false,
  onEdit,
  onDelete,
  onAssign,
  onUnassign,
  onTaskUpdated,
}: TaskWorkspaceDetailPanelProps) {
  const router = useRouter();
  const [actionPending, startTransition] = useTransition();
  const busy = pending || actionPending;
  const memberNames = new Map(
    members.map((member) => [member.userId, member.fullName]),
  );

  function applyUpdated(next: Task) {
    const item = toTaskWorkspaceItem(next, {
      projectNames: task.relatedProjectId
        ? new Map([[task.relatedProjectId, task.relatedProjectName ?? ""]])
        : undefined,
      clientNames: task.relatedClientId
        ? new Map([[task.relatedClientId, task.relatedClientName ?? ""]])
        : undefined,
      vendorNames: task.relatedVendorId
        ? new Map([[task.relatedVendorId, task.relatedVendorName ?? ""]])
        : undefined,
      memberNames,
    });
    onTaskUpdated?.(item);
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-white">{uiZh.taskDetail}</h2>
          <p className="mt-1 text-xs text-white/45">
            Status, schedule, ownership, and relationships
          </p>
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            {!task.archivedAt ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={onEdit}
              >
                Edit task
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
                disabled={busy}
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
                    applyUpdated(result.data.task);
                    toast.success(uiZh.taskCompletedToast);
                    router.refresh();
                  });
                }}
              >
                Complete
              </Button>
            ) : null}
            {task.archivedAt ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
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
                    applyUpdated(result.data.task);
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
                disabled={busy}
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
                    applyUpdated(result.data.task);
                    toast.success(uiZh.taskArchivedToast);
                    router.refresh();
                  });
                }}
              >
                Archive
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      <dl className="mt-5 space-y-4">
        <InfoRow label={uiZh.titleLabel} value={task.title} />
        <InfoRow
          label={uiZh.description}
          value={task.description?.trim() || "—"}
        />
        <InfoRow label={uiZh.status} value={taskStatusLabel(task.status)} />
        <InfoRow label={uiZh.priority} value={taskPriorityLabel(task.priority)} />
        <InfoRow label={uiZh.startDate} value={formatTaskDate(task.startDate)} />
        <InfoRow label={uiZh.dueDate} value={formatTaskDate(task.dueDate)} />
        <InfoRow
          label={uiZh.completedDate}
          value={formatTaskDate(task.completedDate)}
        />
        <InfoRow
          label={uiZh.owner}
          value={
            <TaskPersonDisplay label={task.ownerLabel} emptyLabel={uiZh.unassigned} />
          }
        />
        <InfoRow
          label={uiZh.assignee}
          value={
            <TaskPersonDisplay
              label={task.assigneeLabel}
              emptyLabel={uiZh.unassigned}
            />
          }
        />
        <InfoRow
          label={uiZh.followers}
          value={
            task.followers.length > 0
              ? task.followers
                  .map((id) => memberNames.get(id) ?? id.slice(0, 8))
                  .join(", ")
              : "—"
          }
        />
        <InfoRow
          label={uiZh.tags}
          value={task.tags.length > 0 ? task.tags.join(", ") : "—"}
        />
        <InfoRow
          label={uiZh.relatedProject}
          value={
            task.relatedProjectId && task.relatedProjectName ? (
              <WorkspaceEntityLink kind="project" id={task.relatedProjectId}>
                {task.relatedProjectName}
              </WorkspaceEntityLink>
            ) : (
              task.relatedProjectName || "—"
            )
          }
        />
        <InfoRow
          label={uiZh.client}
          value={
            task.relatedClientId && task.relatedClientName ? (
              <WorkspaceEntityLink kind="client" id={task.relatedClientId}>
                {task.relatedClientName}
              </WorkspaceEntityLink>
            ) : (
              task.relatedClientName || "—"
            )
          }
        />
        <InfoRow
          label={uiZh.vendors}
          value={
            task.relatedVendorId && task.relatedVendorName ? (
              <WorkspaceEntityLink kind="vendor" id={task.relatedVendorId}>
                {task.relatedVendorName}
              </WorkspaceEntityLink>
            ) : (
              task.relatedVendorName || "—"
            )
          }
        />
        <InfoRow
          label={uiZh.meetings}
          value={
            task.relatedMeetingId ? (
              <WorkspaceEntityLink kind="meeting" id={task.relatedMeetingId}>
                {task.relatedMeetingName || uiZh.openMeeting}
              </WorkspaceEntityLink>
            ) : (
              "—"
            )
          }
        />
        <InfoRow
          label={uiZh.archived}
          value={task.archivedAt ? formatTaskDate(task.archivedAt) : "—"}
        />
        <InfoRow label={uiZh.updated} value={formatTaskDate(task.updatedAt)} />
      </dl>

      {canAssign && !task.archivedAt ? (
        <div className="mt-6 space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
          <p className="text-xs font-medium text-white/70">{uiZh.assignment}</p>

          <div className="space-y-2">
            <Label htmlFor={`task-owner-${task.id}`}>{uiZh.owner}</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                id={`task-owner-${task.id}`}
                className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
                disabled={busy}
                value={task.ownerId ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!value) {
                    onUnassign("owner");
                    return;
                  }
                  onAssign("owner", value);
                }}
              >
                <option value="" className="bg-[#121214]">
                  Unassigned
                </option>
                {members.map((member) => (
                  <option
                    key={member.userId}
                    value={member.userId}
                    className="bg-[#121214]"
                  >
                    {member.fullName}
                  </option>
                ))}
              </select>
              {task.ownerId ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onUnassign("owner")}
                >
                  Remove owner
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`task-assignee-${task.id}`}>{uiZh.assignee}</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                id={`task-assignee-${task.id}`}
                className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
                disabled={busy}
                value={task.assigneeId ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  if (!value) {
                    onUnassign("assignee");
                    return;
                  }
                  onAssign("assignee", value);
                }}
              >
                <option value="" className="bg-[#121214]">
                  Unassigned
                </option>
                {members.map((member) => (
                  <option
                    key={member.userId}
                    value={member.userId}
                    className="bg-[#121214]"
                  >
                    {member.fullName}
                  </option>
                ))}
              </select>
              {task.assigneeId ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => onUnassign("assignee")}
                >
                  Remove assignee
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
