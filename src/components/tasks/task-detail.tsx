import Link from "next/link";

import {
  formatFoundationTaskStatus,
  formatTaskDate,
  formatTaskPriority,
} from "@/components/tasks/task-labels";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";
import type { Task } from "@/core/task/types";
import {
  brandPageClassName,
  brandSecondaryButtonClassName,
  brandTitleClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type TaskDetailProps = {
  task: Task;
  projectName: string | null;
  assigneeName: string | null;
  canWrite: boolean;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-baseline">
      <dt className="text-xs tracking-tight text-white/35">{label}</dt>
      <dd className="text-sm text-white/85 break-words">{value}</dd>
    </div>
  );
}

function PlaceholderSection({
  title,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <WorkspaceSection title={title}>
      <SectionEmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="px-4 py-6"
      />
    </WorkspaceSection>
  );
}

export function TaskDetail({
  task,
  projectName,
  assigneeName,
  canWrite,
}: TaskDetailProps) {
  return (
    <div className={cn(brandPageClassName, "max-w-3xl space-y-12")}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/tasks"
            className="text-xs text-white/35 transition duration-200 hover:text-white/60"
          >
            {uiZh.backToList(uiZh.tasks)}
          </Link>
          <h1 className={cn("mt-3", brandTitleClassName)}>{task.title}</h1>
          <p className="mt-2 text-sm text-white/40">
            {formatFoundationTaskStatus(task)}
            <span className="mx-2 text-white/20">·</span>
            {formatTaskPriority(task.priority)}
            {projectName ? (
              <>
                <span className="mx-2 text-white/20">·</span>
                {task.relatedProjectId ? (
                  <Link
                    href={`/dashboard/projects/${task.relatedProjectId}`}
                    className="transition hover:text-white/70"
                  >
                    {projectName}
                  </Link>
                ) : (
                  projectName
                )}
              </>
            ) : null}
          </p>
        </div>
        {canWrite && !task.archivedAt ? (
          <Link
            href={`/dashboard/tasks/${task.id}/edit`}
            className={brandSecondaryButtonClassName}
          >
            {uiZh.edit}
          </Link>
        ) : null}
      </div>

      <WorkspaceSection title={uiZh.overview}>
        <div className="riva-surface rounded-[var(--riva-radius-lg)] px-6 py-6">
          <dl className="space-y-4">
            <InfoRow label={uiZh.taskSingular} value={task.title} />
            <InfoRow label={uiZh.projects} value={projectName ?? uiZh.emDash} />
            <InfoRow label={uiZh.assignee} value={assigneeName ?? uiZh.emDash} />
            <InfoRow
              label={uiZh.priority}
              value={formatTaskPriority(task.priority)}
            />
            <InfoRow
              label={uiZh.status}
              value={formatFoundationTaskStatus(task)}
            />
            <InfoRow label={uiZh.dueDate} value={formatTaskDate(task.dueDate)} />
            <InfoRow
              label={uiZh.description}
              value={task.description?.trim() || uiZh.emDash}
            />
          </dl>
        </div>
      </WorkspaceSection>

      <PlaceholderSection
        title={uiZh.activity}
        emptyTitle={uiZh.noActivityYet}
        emptyDescription={uiZh.taskActivitySoon}
      />

      <PlaceholderSection
        title={uiZh.files}
        emptyTitle={uiZh.noFilesYet}
        emptyDescription={uiZh.taskFilesSoon}
      />

      <PlaceholderSection
        title={uiZh.comments}
        emptyTitle={uiZh.noCommentsYet}
        emptyDescription={uiZh.taskCommentsSoon}
      />

      <PlaceholderSection
        title={uiZh.history}
        emptyTitle={uiZh.noHistoryYet}
        emptyDescription={uiZh.taskHistorySoon}
      />
    </div>
  );
}
