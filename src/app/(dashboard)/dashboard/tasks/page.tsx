import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { listTasks } from "@/core/task/service";
import { TaskList } from "@/components/tasks/task-list";
import { uiZh } from "@/config/ui-zh";
import {
  listTaskOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/task/lib/task-owners";

export default async function TasksPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("task.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionTasks}
      </div>
    );
  }

  const [tasks, projects, owners] = await Promise.all([
    listTasks({
      workspaceId: context.workspace.id,
      companyId: context.company.id,
      includeArchived: true,
    }),
    listProjectsByCompany(context.workspace.id, context.company.id),
    listTaskOwnerOptions(context.workspace.id, context.company.id),
  ]);

  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  const rows = tasks.map((task) => ({
    task,
    projectName: task.relatedProjectId
      ? (projectNames.get(task.relatedProjectId) ?? null)
      : null,
    assigneeName: ownerLabelFromOptions(task.assigneeId, owners),
  }));

  return (
    <TaskList
      workspaceId={context.workspace.id}
      companyId={context.company.id}
      businessName={context.company.name}
      rows={rows}
      projects={projects.map((project) => ({
        id: project.id,
        name: project.name,
      }))}
      assignees={owners.map((owner) => ({
        userId: owner.userId,
        fullName: owner.fullName,
      }))}
      canWrite={context.permissions.has("task.write")}
      canAssign={context.permissions.has("task.assign")}
    />
  );
}
