"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { createTaskAction } from "@/core/actions/task-actions";
import {
  TaskWorkspaceForm,
  emptyToNull,
  parseFollowerIds,
  parseTagList,
  type TaskFormValues,
} from "@/features/task/components/task-workspace-form";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type CreateTaskFormPageProps = {
  workspaceId: string;
  companyId: string;
  projects: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  vendors: Array<{ id: string; name: string }>;
  meetings: Array<{ id: string; name: string }>;
  members: Array<{ userId: string; fullName: string }>;
  canAssign: boolean;
  defaultProjectId?: string;
  defaultOwnerId?: string;
};

export function CreateTaskFormPage({
  workspaceId,
  companyId,
  projects,
  clients,
  vendors,
  meetings,
  members,
  canAssign,
  defaultProjectId = "",
  defaultOwnerId = "",
}: CreateTaskFormPageProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(values: TaskFormValues) {
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
        ownerId: emptyToNull(values.ownerId) ?? (defaultOwnerId || null),
        assigneeId: emptyToNull(values.assigneeId),
        followers: parseFollowerIds(values.followersRaw),
        relatedProjectId:
          emptyToNull(values.relatedProjectId) ?? (defaultProjectId || null),
        relatedClientId: emptyToNull(values.relatedClientId),
        relatedVendorId: emptyToNull(values.relatedVendorId),
        relatedMeetingId: emptyToNull(values.relatedMeetingId),
        tags: parseTagList(values.tagsRaw),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(uiZh.taskCreated);
      router.push(buildWorkspaceOverviewHref("task", result.data.task.id));
      router.refresh();
    });
  }

  return (
    <TaskWorkspaceForm
      mode="create"
      initial={{
        id: "new",
        workspaceId,
        companyId,
        title: "",
        description: null,
        status: "todo",
        priority: "normal",
        startDate: null,
        dueDate: null,
        completedDate: null,
        ownerId: defaultOwnerId || null,
        assigneeId: null,
        followers: [],
        relatedProjectId: defaultProjectId || null,
        relatedClientId: null,
        relatedVendorId: null,
        relatedMeetingId: null,
        tags: [],
        archivedAt: null,
        createdBy: defaultOwnerId || workspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        relatedProjectName: null,
        relatedClientName: null,
        relatedVendorName: null,
        relatedMeetingName: null,
        ownerLabel: null,
        assigneeLabel: null,
      }}
      projects={projects}
      clients={clients}
      vendors={vendors}
      meetings={meetings}
      members={members}
      canAssign={canAssign}
      pending={pending}
      onCancel={() => router.push("/dashboard/tasks")}
      onSubmit={handleSubmit}
    />
  );
}
