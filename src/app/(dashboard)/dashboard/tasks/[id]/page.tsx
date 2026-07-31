import { notFound, redirect } from "next/navigation";

import { TaskDetail } from "@/components/tasks/task-detail";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import { listMembershipsByWorkspace } from "@/core/membership/memberships";
import { listProjectsByCompany } from "@/core/project/project";
import {
  getTask,
  listTaskActivities,
  listTasks,
} from "@/core/task/service";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { TaskWorkspace } from "@/features/task/components/task-workspace";
import {
  listTaskOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/task/lib/task-owners";
import {
  TASK_WORKSPACE_HUB_ID,
  type TaskAssignableMember,
  type TaskWorkspaceModel,
} from "@/features/task/lib/task-types";
import { toTaskWorkspaceItem } from "@/features/task/lib/task-workspace-map";
import {
  buildTaskWorkspaceTabHref,
  parseTaskWorkspaceTab,
} from "@/features/task/lib/task-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; task?: string }>;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function TaskWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("task.read")) {
    notFound();
  }

  const hubId = id.trim() || TASK_WORKSPACE_HUB_ID;
  const initialTab = parseTaskWorkspaceTab(query.tab);
  const initialTaskId = query.task?.trim() || null;

  if (hubId !== TASK_WORKSPACE_HUB_ID && !UUID_RE.test(hubId)) {
    redirect(
      buildTaskWorkspaceTabHref(TASK_WORKSPACE_HUB_ID, initialTab, {
        explicitOverview: true,
        taskId: initialTaskId,
      }),
    );
  }

  if (UUID_RE.test(hubId)) {
    let task;
    try {
      task = await getTask({
        workspaceId: context.workspace.id,
        companyId: context.company.id,
        taskId: hubId,
      });
    } catch {
      notFound();
    }

    const [projects, owners] = await Promise.all([
      listProjectsByCompany(context.workspace.id, context.company.id),
      listTaskOwnerOptions(context.workspace.id, context.company.id),
    ]);

    const projectName = task.relatedProjectId
      ? (projects.find((project) => project.id === task.relatedProjectId)
          ?.name ?? null)
      : null;

    return (
      <TaskDetail
        task={task}
        projectName={projectName}
        assigneeName={ownerLabelFromOptions(task.assigneeId, owners)}
        canWrite={context.permissions.has("task.write")}
      />
    );
  }

  const [tasks, projects, clients, vendors, meetings, memberships, activities] =
    await Promise.all([
      listTasks({
        workspaceId: context.workspace.id,
        companyId: context.company.id,
      }),
      listProjectsByCompany(context.workspace.id, context.company.id),
      listClientsByCompany(context.workspace.id, context.company.id),
      listVendorsByCompany(context.workspace.id, context.company.id),
      listMeetingsByCompany(context.workspace.id, context.company.id),
      listMembershipsByWorkspace(context.workspace.id),
      listTaskActivities({
        workspaceId: context.workspace.id,
        companyId: context.company.id,
        limit: 100,
      }),
    ]);

  const membersByUser = new Map<string, TaskAssignableMember>();
  for (const membership of memberships) {
    if (
      membership.company_id !== context.company.id ||
      membership.status !== "accepted" ||
      !membership.user_id
    ) {
      continue;
    }
    if (!membersByUser.has(membership.user_id)) {
      membersByUser.set(membership.user_id, {
        userId: membership.user_id,
        fullName: membership.full_name,
        email: membership.email,
      });
    }
  }
  const members = [...membersByUser.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );

  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );
  const clientNames = new Map(
    clients.map((client) => [client.id, client.name]),
  );
  const vendorNames = new Map(
    vendors.map((vendor) => [vendor.id, vendor.name]),
  );
  const meetingNames = new Map(
    meetings.map((meeting) => [meeting.id, meeting.title]),
  );
  const memberNames = new Map(
    members.map((member) => [member.userId, member.fullName]),
  );

  const model: TaskWorkspaceModel = {
    id: TASK_WORKSPACE_HUB_ID,
    title: uiZh.taskWorkspace,
    description: uiZh.tasksFor(context.company.name),
    workspaceId: context.workspace.id,
    companyId: context.company.id,
    canWrite: context.permissions.has("task.write"),
    canAssign: context.permissions.has("task.assign"),
    canComplete: context.permissions.has("task.complete"),
    tasks: tasks.map((task) => {
      const item = toTaskWorkspaceItem(task, {
        projectNames,
        clientNames,
        vendorNames,
        memberNames,
      });
      if (task.relatedMeetingId) {
        item.relatedMeetingName =
          meetingNames.get(task.relatedMeetingId) ?? null;
      }
      return item;
    }),
    activities: activities.map((activity) => ({
      ...activity,
      actorLabel: memberNames.get(activity.actorId) ?? null,
    })),
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
    })),
    clients: clients.map((client) => ({ id: client.id, name: client.name })),
    vendors: vendors.map((vendor) => ({ id: vendor.id, name: vendor.name })),
    meetings: meetings.map((meeting) => ({
      id: meeting.id,
      name: meeting.title,
    })),
    members,
  };

  return (
    <WorkspaceLayout backHref="/dashboard/tasks" backLabel={uiZh.backToList(uiZh.tasks)}>
      <TaskWorkspace
        model={model}
        initialTab={initialTab}
        initialTaskId={initialTaskId}
      />
    </WorkspaceLayout>
  );
}
