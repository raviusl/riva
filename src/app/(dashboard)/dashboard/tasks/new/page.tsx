import Link from "next/link";
import { redirect } from "next/navigation";

import { TaskForm } from "@/components/tasks/task-form";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { listTaskOwnerOptions } from "@/features/task/lib/task-owners";

type PageProps = {
  searchParams: Promise<{ projectId?: string }>;
};

/**
 * Legacy full-page create route — kept for deep links / Quick Actions.
 * Prefer the Create Task modal on the Tasks list.
 */
export default async function NewTaskPage({ searchParams }: PageProps) {
  const context = await requireDashboardContext();
  const params = await searchParams;

  if (!context.permissions.has("task.write")) {
    redirect("/dashboard/tasks");
  }

  const [projects, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listTaskOwnerOptions(context.workspace.id, context.company.id),
  ]);

  const requestedProjectId = params.projectId?.trim() ?? "";
  const defaultProjectId = projects.some(
    (project) => project.id === requestedProjectId,
  )
    ? requestedProjectId
    : "";

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/tasks"
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.tasks)}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          {uiZh.createTask}
        </h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.addTaskFor(context.company.name)}
        </p>
      </div>

      <div className="riva-surface rounded-[var(--riva-radius-lg)] p-6">
        <TaskForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          projects={projects.map((project) => ({
            id: project.id,
            name: project.name,
          }))}
          assignees={owners.map((owner) => ({
            userId: owner.userId,
            fullName: owner.fullName,
          }))}
          canAssign={context.permissions.has("task.assign")}
          defaultProjectId={defaultProjectId}
        />
      </div>
    </div>
  );
}
