import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { ClientList } from "@/components/crm/client-list";
import { uiZh } from "@/config/ui-zh";

export default async function ClientsPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionClients}
      </div>
    );
  }

  const [clients, projects] = await Promise.all([
    listClientsByCompany(context.workspace.id, context.company.id),
    context.permissions.has("project.read")
      ? listProjectsByCompany(context.workspace.id, context.company.id)
      : Promise.resolve([]),
  ]);
  const canWrite = context.permissions.has("client.write");

  const projectCountByClient = new Map<string, number>();
  for (const project of projects) {
    if (!project.client_id) continue;
    projectCountByClient.set(
      project.client_id,
      (projectCountByClient.get(project.client_id) ?? 0) + 1,
    );
  }

  const rows = clients.map((client) => ({
    client,
    projectCount:
      projectCountByClient.get(client.id) ?? (client.project_id ? 1 : 0),
  }));

  return (
    <ClientList
      workspaceId={context.workspace.id}
      companyId={context.company.id}
      businessName={context.company.name}
      rows={rows}
      canWrite={canWrite}
    />
  );
}
