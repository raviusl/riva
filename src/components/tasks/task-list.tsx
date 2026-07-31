"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import type { TaskAssigneeOption } from "@/components/tasks/task-form";
import {
  formatFoundationTaskStatus,
  formatTaskDate,
  formatTaskPriority,
} from "@/components/tasks/task-labels";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uiZh } from "@/config/ui-zh";
import type { Task } from "@/core/task/types";
import type { Project } from "@/core/types";
import { cn } from "@/lib/utils";

export type TaskListRow = {
  task: Task;
  projectName: string | null;
  assigneeName: string | null;
};

type SortKey =
  | "title"
  | "project"
  | "assignee"
  | "priority"
  | "status"
  | "dueDate";

type SortDir = "asc" | "desc";

type TaskListProps = {
  workspaceId: string;
  companyId: string;
  businessName: string;
  rows: TaskListRow[];
  projects: Pick<Project, "id" | "name">[];
  assignees: TaskAssigneeOption[];
  canWrite: boolean;
  canAssign: boolean;
};

const PRIORITY_RANK: Record<string, number> = {
  low: 1,
  normal: 2,
  high: 3,
  urgent: 4,
};

const STATUS_RANK: Record<string, number> = {
  todo: 1,
  in_progress: 2,
  waiting: 2,
  completed: 3,
  cancelled: 4,
};

function taskStatusRank(task: Task): number {
  if (task.archivedAt || task.status === "cancelled") return 4;
  return STATUS_RANK[task.status] ?? 0;
}

function compareValues(
  a: string | number,
  b: string | number,
  dir: SortDir,
): number {
  if (a < b) return dir === "asc" ? -1 : 1;
  if (a > b) return dir === "asc" ? 1 : -1;
  return 0;
}

export function TaskList({
  workspaceId,
  companyId,
  businessName,
  rows,
  projects,
  assignees,
  canWrite,
  canAssign,
}: TaskListProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter(({ task, projectName, assigneeName }) => {
          const haystack = [
            task.title,
            projectName ?? "",
            assigneeName ?? "",
            formatTaskPriority(task.priority),
            formatFoundationTaskStatus(task),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : rows;

    return [...base].sort((left, right) => {
      switch (sortKey) {
        case "title":
          return compareValues(
            left.task.title.toLowerCase(),
            right.task.title.toLowerCase(),
            sortDir,
          );
        case "project":
          return compareValues(
            (left.projectName ?? "").toLowerCase(),
            (right.projectName ?? "").toLowerCase(),
            sortDir,
          );
        case "assignee":
          return compareValues(
            (left.assigneeName ?? "").toLowerCase(),
            (right.assigneeName ?? "").toLowerCase(),
            sortDir,
          );
        case "priority":
          return compareValues(
            PRIORITY_RANK[left.task.priority] ?? 0,
            PRIORITY_RANK[right.task.priority] ?? 0,
            sortDir,
          );
        case "status":
          return compareValues(
            taskStatusRank(left.task),
            taskStatusRank(right.task),
            sortDir,
          );
        case "dueDate":
          return compareValues(
            left.task.dueDate ?? "9999-99-99",
            right.task.dueDate ?? "9999-99-99",
            sortDir,
          );
        default:
          return 0;
      }
    });
  }, [query, rows, sortDir, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function SortButton({
    label,
    column,
    className,
  }: {
    label: string;
    column: SortKey;
    className?: string;
  }) {
    const active = sortKey === column;
    return (
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className={cn(
          "inline-flex items-center gap-1 text-left transition duration-[var(--riva-motion)]",
          active ? "text-white/70" : "text-white/35 hover:text-white/55",
          className,
        )}
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          )
        ) : null}
      </button>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
            {uiZh.projects}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.75rem]">
            {uiZh.tasks}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/40">
            {uiZh.operationalWorkFor(businessName)}
          </p>
        </div>
        {canWrite ? (
          <TaskCreateDialog
            workspaceId={workspaceId}
            companyId={companyId}
            projects={projects}
            assignees={assignees}
            canAssign={canAssign}
          />
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={uiZh.searchTasks}
            className="h-10 max-w-md"
            aria-label={uiZh.searchTasks}
          />
          <p className="text-xs text-white/35">
            {uiZh.countOfTotal(filtered.length, rows.length)}
          </p>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="space-y-4">
          <SectionEmptyState
            title={uiZh.noTasksYet}
            description={uiZh.createTaskLinkProject}
          />
          {canWrite ? (
            <TaskCreateDialog
              workspaceId={workspaceId}
              companyId={companyId}
              projects={projects}
              assignees={assignees}
              canAssign={canAssign}
            />
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <SectionEmptyState
          title={uiZh.noMatchingTasks}
          description={uiZh.tryDifferentSearch}
        />
      ) : (
        <div className="riva-surface overflow-hidden rounded-[var(--riva-radius-lg)]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] hover:bg-transparent">
                <TableHead>
                  <SortButton label={uiZh.taskSingular} column="title" />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortButton label={uiZh.projects} column="project" />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton label={uiZh.assignee} column="assignee" />
                </TableHead>
                <TableHead>
                  <SortButton label={uiZh.priority} column="priority" />
                </TableHead>
                <TableHead>
                  <SortButton label={uiZh.status} column="status" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortButton label={uiZh.dueDate} column="dueDate" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ task, projectName, assigneeName }) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="font-medium text-white/90 transition hover:text-white"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {projectName ? (
                      task.relatedProjectId ? (
                        <Link
                          href={`/dashboard/projects/${task.relatedProjectId}`}
                          className="text-white/70 transition hover:text-white"
                        >
                          {projectName}
                        </Link>
                      ) : (
                        projectName
                      )
                    ) : (
                      uiZh.emDash
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {assigneeName ?? uiZh.emDash}
                  </TableCell>
                  <TableCell>{formatTaskPriority(task.priority)}</TableCell>
                  <TableCell>{formatFoundationTaskStatus(task)}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatTaskDate(task.dueDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
