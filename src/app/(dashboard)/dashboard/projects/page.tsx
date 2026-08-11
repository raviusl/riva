import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { ProjectList } from "@/components/projects/project-list";
import { uiZh } from "@/config/ui-zh";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";

export default async function ProjectsPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionProjects}
      </div>
    );
  }

  const [projects, clients, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    context.permissions.has("client.read")
      ? listClientsByCompany(context.workspace.id, context.company.id)
      : Promise.resolve([]),
    listClientOwnerOptions(context.workspace.id, context.company.id),
  ]);

  const clientsById = new Map(
    clients.map((client) => [
      client.id,
      client.display_name || client.name,
    ]),
  );
  const clientsByProject = new Map<string, string>();
  for (const client of clients) {
    if (client.project_id && !clientsByProject.has(client.project_id)) {
      clientsByProject.set(
        client.project_id,
        client.display_name || client.name,
      );
    }
  }

  const rows = projects.map((project) => ({
    project,
    clientName:
      (project.client_id ? clientsById.get(project.client_id) : null) ??
      clientsByProject.get(project.id) ??
      null,
    ownerName: ownerLabelFromOptions(project.owner_id, owners),
  }));

  return (
    <ProjectList
      workspaceId={context.workspace.id}
      companyId={context.company.id}
      businessName={context.company.name}
      rows={rows}
      clients={clients}
      canWrite={context.permissions.has("project.write")}
    />
  );
}
