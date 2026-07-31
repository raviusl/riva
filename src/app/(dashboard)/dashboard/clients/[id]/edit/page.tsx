import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { getClientById } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { EditClientForm } from "@/features/client/components/edit-client-form";
import { listClientOwnerOptions } from "@/features/client/lib/client-owners";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.write")) {
    redirect("/dashboard/clients");
  }

  let client;
  try {
    client = await getClientById(
      id,
      context.workspace.id,
      context.company.id,
    );
  } catch {
    notFound();
  }

  if (client.status === "archived") {
    redirect(`/dashboard/clients/${client.id}`);
  }

  const [projects, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientOwnerOptions(context.workspace.id, context.company.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(client.name)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.editClient}</h1>
        <p className="mt-2 text-sm text-white/45">{client.name}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditClientForm
          client={client}
          projects={projects}
          owners={owners}
        />
      </div>
    </div>
  );
}
