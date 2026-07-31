"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { updateTaskAction } from "@/core/actions/task-actions";
import type { Task } from "@/core/task";
import {
  TaskWorkspaceForm,
  emptyToNull,
  parseFollowerIds,
  parseTagList,
  type TaskFormValues,
} from "@/features/task/components/task-workspace-form";
import { toTaskWorkspaceItem } from "@/features/task/lib/task-workspace-map";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type EditTaskFormPageProps = {
  task: Task;
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; name: string }>;
  meetings: Array<{ id: string; name: string }>;
  members: Array<{ userId: string; fullName: string }>;
  canAssign: boolean;
};

export function EditTaskFormPage({
  task,
  projects,
  clients,
  vendors,
  meetings,
  members,
  canAssign,
}: EditTaskFormPageProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const initial = toTaskWorkspaceItem(task, {
    projectNames: new Map(projects.map((item) => [item.id, item.name])),
    clientNames: new Map(clients.map((item) => [item.id, item.name])),
    vendorNames: new Map(vendors.map((item) => [item.id, item.name])),
    memberNames: new Map(members.map((item) => [item.userId, item.fullName])),
  });

  function handleSubmit(values: TaskFormValues) {
    startTransition(async () => {
      const result = await updateTaskAction({
        workspaceId: task.workspaceId,
        companyId: task.companyId,
        taskId: task.id,
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
      toast.success(uiZh.taskUpdated);
      router.push(buildWorkspaceOverviewHref("task", task.id));
      router.refresh();
    });
  }

  return (
    <TaskWorkspaceForm
      mode="edit"
      initial={initial}
      projects={projects}
      clients={clients}
      vendors={vendors}
      meetings={meetings}
      members={members}
      canAssign={canAssign}
      pending={pending}
      onCancel={() => router.push(buildWorkspaceOverviewHref("task", task.id))}
      onSubmit={handleSubmit}
    />
  );
}
