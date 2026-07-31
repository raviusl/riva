import Link from "next/link";

import type { Task } from "@/core/task";
import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import {
  formatTaskDate,
  taskPriorityLabel,
  taskStatusLabel,
} from "@/features/task/lib/task-labels";
import { TASK_WORKSPACE_HUB_ID } from "@/features/task/lib/task-types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type MyTasksPreviewProps = {
  tasks: Task[];
  projectNames: Map<string, string>;
  canRead: boolean;
};

export function MyTasksPreview({
  tasks,
  projectNames,
  canRead,
}: MyTasksPreviewProps) {
  const href = buildWorkspaceOverviewHref("task", TASK_WORKSPACE_HUB_ID);

  return (
    <DashboardSection
      title={uiZh.myTasks}
      description={uiZh.openUpcomingWork}
      actionHref={canRead ? "/dashboard/tasks" : undefined}
      actionLabel={canRead ? uiZh.allTasksArrow : undefined}
    >
      {!canRead ? (
        <p className="text-sm text-white/45">
          {uiZh.noPermissionTasks}
        </p>
      ) : tasks.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-white/45">{uiZh.noOpenTasksYet}</p>
          <Link
            href={href}
            className="inline-flex text-xs text-white/45 hover:text-white/70"
          >
            {uiZh.openTaskWorkspaceArrow}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{task.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {taskStatusLabel(task.status)} ·{" "}
                    {taskPriorityLabel(task.priority)}
                    {task.dueDate
                      ? ` · Due ${formatTaskDate(task.dueDate)}`
                      : ""}
                    {task.relatedProjectId
                      ? ` · ${projectNames.get(task.relatedProjectId) ?? ""}`
                      : ""}
                  </p>
                </div>
                <Link
                  href={buildWorkspaceOverviewHref("task", task.id)}
                  className="shrink-0 text-xs text-white/45 hover:text-white/70"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
