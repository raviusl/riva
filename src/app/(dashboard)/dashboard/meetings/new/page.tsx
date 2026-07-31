import Link from "next/link";
import { redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { CreateMeetingForm } from "@/features/meeting/components/create-meeting-form";
import { listMeetingOwnerOptions } from "@/features/meeting/lib/meeting-owners";

type PageProps = {
  searchParams: Promise<{
    projectId?: string;
    clientId?: string;
  }>;
};

export default async function NewMeetingPage({ searchParams }: PageProps) {
  const context = await requireDashboardContext();
  const params = await searchParams;

  if (!context.permissions.has("meeting.write")) {
    redirect("/dashboard/meetings");
  }

  const [projects, clients, vendors, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listVendorsByCompany(context.workspace.id, context.company.id),
    listMeetingOwnerOptions(context.workspace.id, context.company.id),
  ]);

  const requestedProjectId = params.projectId?.trim() ?? "";
  const requestedClientId = params.clientId?.trim() ?? "";
  const defaultProjectId = projects.some(
    (project) => project.id === requestedProjectId,
  )
    ? requestedProjectId
    : "";
  const defaultClientId = clients.some(
    (client) => client.id === requestedClientId,
  )
    ? requestedClientId
    : "";

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/meetings"
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.meetings)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.createMeeting}</h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.scheduleMeetingFor(context.company.name)}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateMeetingForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          projects={projects}
          clients={clients}
          vendors={vendors}
          owners={owners}
          defaultProjectId={defaultProjectId}
          defaultClientId={defaultClientId}
          defaultOwnerId={context.userId}
        />
      </div>
    </div>
  );
}
