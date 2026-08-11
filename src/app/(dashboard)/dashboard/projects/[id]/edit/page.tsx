import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { getProjectById } from "@/core/project/project";
import { listClientOwnerOptions } from "@/features/client/lib/client-owners";
import { EditProjectForm } from "@/features/project/components/edit-project-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.write")) {
    redirect("/dashboard/projects");
  }

  let project;
  try {
    project = await getProjectById(id, context.workspace.id);
  } catch {
    notFound();
  }

  if (project.company_id !== context.company.id) {
    notFound();
  }

  if (project.status === "archived") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="text-xs text-white/40 hover:text-white/70"
          >
            {uiZh.backToList(project.name)}
          </Link>
          <h1 className="mt-3 text-xl text-white">{uiZh.editProject}</h1>
          <p className="mt-2 text-sm text-white/45">{project.name}</p>
        </div>
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <p className="text-sm text-white/55">
            {uiZh.projectArchivedCannotEdit}
          </p>
          <Link
            href={`/dashboard/projects/${project.id}`}
            className="inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-black hover:bg-white/90"
          >
            {uiZh.backToList(project.name)}
          </Link>
        </div>
      </div>
    );
  }

  const owners = await listClientOwnerOptions(
    context.workspace.id,
    context.company.id,
  );

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(project.name)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.editProject}</h1>
        <p className="mt-2 text-sm text-white/45">{project.name}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditProjectForm project={project} owners={owners} />
      </div>
    </div>
  );
}
