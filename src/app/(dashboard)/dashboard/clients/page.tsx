import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
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

  const clients = await listClientsByCompany(
    context.workspace.id,
    context.company.id,
  );
  const canWrite = context.permissions.has("client.write");

  const rows = clients.map((client) => ({
    client,
    projectCount: client.project_id ? 1 : 0,
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
