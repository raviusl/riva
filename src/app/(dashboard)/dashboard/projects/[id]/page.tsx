import { notFound } from "next/navigation";

import { ProjectProfile } from "@/components/projects/project-profile";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByProject } from "@/core/client/client";
import { getProjectById } from "@/core/project/project";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectProfilePage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.read")) {
    notFound();
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

  const [linkedClients, owners] = await Promise.all([
    context.permissions.has("client.read")
      ? listClientsByProject(
          context.workspace.id,
          context.company.id,
          project.id,
        )
      : Promise.resolve([]),
    listClientOwnerOptions(context.workspace.id, context.company.id),
  ]);

  return (
    <ProjectProfile
      project={project}
      clientName={linkedClients[0]?.name ?? null}
      ownerName={ownerLabelFromOptions(project.owner_id, owners)}
      canWrite={context.permissions.has("project.write")}
      canReadTimeline={context.permissions.has("timeline.read")}
    />
  );
}
