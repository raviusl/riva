/**
 * Task → Global Search document adapter (Project 055).
 */

import type { Task } from "@/core/task/types";
import {
  taskPriorityLabel,
  taskStatusLabel,
} from "@/features/task/lib/task-labels";
import type { GlobalSearchDocument } from "@/features/search/search-result";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export function toTaskSearchDocument(
  task: Task,
): GlobalSearchDocument & { href: string } {
  const keywords = [
    task.title,
    task.description,
    taskStatusLabel(task.status),
    taskPriorityLabel(task.priority),
    ...task.tags,
  ].filter((value): value is string => Boolean(value && value.trim()));

  return {
    id: `task:${task.id}`,
    entityType: "task",
    entityId: task.id,
    companyId: task.companyId,
    workspaceId: task.workspaceId,
    title: task.title,
    subtitle: [
      taskStatusLabel(task.status),
      taskPriorityLabel(task.priority),
      task.dueDate ? `Due ${task.dueDate}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    keywords,
    tags: [task.status, task.priority, ...task.tags],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    href: buildWorkspaceOverviewHref("task", task.id),
  };
}

export function toTaskSearchDocuments(
  tasks: readonly Task[],
): Array<GlobalSearchDocument & { href: string }> {
  return tasks
    .filter((task) => !task.archivedAt && task.status !== "cancelled")
    .map(toTaskSearchDocument);
}
