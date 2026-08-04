import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectForm } from "@/components/projects/project-form";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { getClientById, listClientsByCompany } from "@/core/client/client";

type PageProps = {
  searchParams: Promise<{ clientId?: string }>;
};

/**
 * Create Project — optionally prefilled from Client CRM (?clientId=).
 */
export default async function NewProjectPage({ searchParams }: PageProps) {
  const { clientId } = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.write")) {
    redirect("/dashboard/projects");
  }

  const clients = context.permissions.has("client.read")
    ? await listClientsByCompany(context.workspace.id, context.company.id)
    : [];

  let defaultClient = null as Awaited<ReturnType<typeof getClientById>> | null;
  if (clientId && context.permissions.has("client.read")) {
    try {
      defaultClient = await getClientById(
        clientId,
        context.workspace.id,
        context.company.id,
      );
    } catch {
      defaultClient = null;
    }
  }

  const defaultName =
    defaultClient?.display_name ||
    [defaultClient?.bride_name, defaultClient?.groom_name]
      .filter(Boolean)
      .join(" & ") ||
    (defaultClient ? `${defaultClient.name} Wedding` : "");

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href={
            defaultClient
              ? `/dashboard/clients/${defaultClient.id}?tab=projects`
              : "/dashboard/projects"
          }
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(defaultClient ? uiZh.clients : uiZh.projects)}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          {uiZh.createWeddingProject}
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
          defaultClientId={defaultClient?.id}
          defaultName={defaultName}
          defaultWeddingDate={defaultClient?.wedding_date}
        />
      </div>
    </div>
  );
}
