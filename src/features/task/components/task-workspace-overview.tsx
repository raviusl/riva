import Link from "next/link";
import type { ReactNode } from "react";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import type { TaskWorkspaceModel } from "@/features/task/lib/task-types";
import {
  formatTaskDate,
  taskPriorityLabel,
  taskStatusLabel,
} from "@/features/task/lib/task-labels";
import { buildTaskWorkspaceTabHref } from "@/features/task/lib/task-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type TaskWorkspaceOverviewProps = {
  workspace: TaskWorkspaceModel;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

function countByStatus(workspace: TaskWorkspaceModel) {
  return {
    todo: workspace.tasks.filter((task) => task.status === "todo").length,
    in_progress: workspace.tasks.filter((task) => task.status === "in_progress")
      .length,
    waiting: workspace.tasks.filter((task) => task.status === "waiting").length,
    completed: workspace.tasks.filter((task) => task.status === "completed")
      .length,
    cancelled: workspace.tasks.filter((task) => task.status === "cancelled")
      .length,
  };
}

export function TaskWorkspaceOverview({
  workspace,
}: TaskWorkspaceOverviewProps) {
  const counts = countByStatus(workspace);
  const recent = [...workspace.tasks]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const tasksHref = buildTaskWorkspaceTabHref(workspace.id, "tasks", {
    explicitOverview: true,
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.workspaceSummary}</h2>
            <p className="mt-1 text-xs text-white/45">
              Open work across linked projects and relationships
            </p>
          </div>
          <Link
            href={tasksHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            View tasks
          </Link>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.total} value={String(workspace.tasks.length)} />
          <InfoRow label={uiZh.todo} value={String(counts.todo)} />
          <InfoRow label={uiZh.inProgress} value={String(counts.in_progress)} />
          <InfoRow label={uiZh.waiting} value={String(counts.waiting)} />
          <InfoRow label={uiZh.completed} value={String(counts.completed)} />
          <InfoRow label={uiZh.cancelled} value={String(counts.cancelled)} />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.recentTasks}</h2>
        <p className="mt-1 text-xs text-white/45">
          Latest updates in this workspace
        </p>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noTasksYet}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((task) => (
              <li key={task.id}>
                <Link
                  href={buildTaskWorkspaceTabHref(workspace.id, "tasks", {
                    taskId: task.id,
                  })}
                  className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
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
                    {task.relatedProjectName
                      ? ` · ${task.relatedProjectName}`
                      : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.relationships}</h2>
        <p className="mt-1 text-xs text-white/45">
          Linked entities from sample tasks in this preview
        </p>

        <dl className="mt-5 space-y-4">
          <InfoRow
            label={uiZh.projects}
            value={
              uniqueLinks(
                workspace.tasks.map((task) => ({
                  id: task.relatedProjectId,
                  name: task.relatedProjectName,
                  kind: "project" as const,
                })),
              )
            }
          />
          <InfoRow
            label={uiZh.clients}
            value={
              uniqueLinks(
                workspace.tasks.map((task) => ({
                  id: task.relatedClientId,
                  name: task.relatedClientName,
                  kind: "client" as const,
                })),
              )
            }
          />
          <InfoRow
            label={uiZh.vendors}
            value={
              uniqueLinks(
                workspace.tasks.map((task) => ({
                  id: task.relatedVendorId,
                  name: task.relatedVendorName,
                  kind: "vendor" as const,
                })),
              )
            }
          />
          <InfoRow
            label={uiZh.meetings}
            value={
              uniqueLinks(
                workspace.tasks.map((task) => ({
                  id: task.relatedMeetingId,
                  name: task.relatedMeetingName,
                  kind: "meeting" as const,
                })),
              )
            }
          />
        </dl>
      </section>
    </div>
  );
}

function uniqueLinks(
  items: Array<{
    id: string | null;
    name: string | null;
    kind: "project" | "client" | "vendor" | "meeting";
  }>,
): ReactNode {
  const seen = new Map<string, { id: string; name: string; kind: typeof items[number]["kind"] }>();
  for (const item of items) {
    if (!item.id || !item.name || seen.has(item.id)) continue;
    seen.set(item.id, { id: item.id, name: item.name, kind: item.kind });
  }
  const list = [...seen.values()];
  if (list.length === 0) return "—";

  return (
    <span className="flex flex-col gap-1">
      {list.map((item) => (
        <WorkspaceEntityLink key={item.id} kind={item.kind} id={item.id}>
          {item.name}
        </WorkspaceEntityLink>
      ))}
    </span>
  );
}
