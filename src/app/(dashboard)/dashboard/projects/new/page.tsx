import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectForm } from "@/components/projects/project-form";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";

/**
 * Legacy full-page create route — kept for deep links / Quick Actions.
 * Prefer the Create Project modal on the Projects list.
 */
export default async function NewProjectPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.write")) {
    redirect("/dashboard/projects");
  }

  const clients = context.permissions.has("client.read")
    ? await listClientsByCompany(context.workspace.id, context.company.id)
    : [];

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/projects"
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.projects)}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          {uiZh.createProject}
        </h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.addProjectTo(context.company.name)}
        </p>
      </div>

      <div className="riva-surface rounded-[var(--riva-radius-lg)] p-6">
        <ProjectForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          clients={clients}
        />
      </div>
    </div>
  );
}
