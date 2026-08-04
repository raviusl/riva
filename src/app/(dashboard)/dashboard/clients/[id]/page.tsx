import { Suspense } from "react";
import { notFound } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { listClientAuditTrail } from "@/core/client/audit";
import { getClientById } from "@/core/client/client";
import { listProjectsByClient } from "@/core/project/project";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";
import { listClientRelatedMeetings } from "@/features/client/lib/client-related-meetings";
import { ClientWorkspace } from "@/features/client/components/client-workspace";
import {
  parseClientWorkspaceTab,
  type ClientWorkspaceTabId,
} from "@/features/client/lib/client-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ClientWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.read")) {
    notFound();
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

  const initialTab: ClientWorkspaceTabId = parseClientWorkspaceTab(tab);

  const [projects, owners, meetings] = await Promise.all([
    context.permissions.has("project.read")
      ? listProjectsByClient(
          context.workspace.id,
          context.company.id,
          client.id,
        )
      : Promise.resolve([]),
    listClientOwnerOptions(context.workspace.id, context.company.id),
    listClientRelatedMeetings(
      context.workspace.id,
      context.company.id,
      client,
    ).catch(() => []),
  ]);

  const linkedProject =
    projects.find((p) => p.id === client.project_id) ?? projects[0] ?? null;

  const activity = listClientAuditTrail(context.company.id, client.id);

  return (
    <Suspense fallback={null}>
      <ClientWorkspace
        workspaceId={context.workspace.id}
        companyId={context.company.id}
        client={client}
        linkedProject={linkedProject}
        projects={projects}
        ownerLabel={ownerLabelFromOptions(
          client.lead_owner_id ?? client.owner_id,
          owners,
        )}
        picLabel={ownerLabelFromOptions(client.assigned_pic_id, owners)}
        meetings={meetings}
        activity={activity}
        canWriteClient={context.permissions.has("client.write")}
        canWriteProject={context.permissions.has("project.write")}
        initialTab={initialTab}
      />
    </Suspense>
  );
}
