import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import { listProjectsByCompany } from "@/core/project/project";
import { getTask } from "@/core/task/service";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { EditTaskFormPage } from "@/features/task/components/edit-task-form-page";
import { listTaskOwnerOptions } from "@/features/task/lib/task-owners";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTaskPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("task.write")) {
    redirect("/dashboard/tasks");
  }

  if (id === "workspace" || id === "new") {
    redirect("/dashboard/tasks");
  }

  let task;
  try {
    task = await getTask({
      workspaceId: context.workspace.id,
      companyId: context.company.id,
      taskId: id,
    });
  } catch {
    notFound();
  }

  if (task.archivedAt) {
    redirect(`/dashboard/tasks/${task.id}`);
  }

  const [projects, clients, vendors, meetings, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listVendorsByCompany(context.workspace.id, context.company.id),
    listMeetingsByCompany(context.workspace.id, context.company.id),
    listTaskOwnerOptions(context.workspace.id, context.company.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href={`/dashboard/tasks/${task.id}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.taskSingular)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.editTask}</h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.updateDetailsFor(task.title)}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditTaskFormPage
          task={task}
          projects={projects.map((project) => ({
            id: project.id,
            name: project.name,
          }))}
          clients={clients.map((client) => ({
            id: client.id,
            name: client.name,
          }))}
          vendors={vendors.map((vendor) => ({
            id: vendor.id,
            name: vendor.name,
          }))}
          meetings={meetings.map((meeting) => ({
            id: meeting.id,
            name: meeting.title,
          }))}
          members={owners.map((owner) => ({
            userId: owner.userId,
            fullName: owner.fullName,
          }))}
          canAssign={context.permissions.has("task.assign")}
        />
      </div>
    </div>
  );
}
