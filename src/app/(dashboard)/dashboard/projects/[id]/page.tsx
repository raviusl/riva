import { Suspense } from "react";
import { notFound } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByProject } from "@/core/client/client";
import { getProjectById } from "@/core/project/project";
import { listVendorsByProject } from "@/core/vendor/vendor";
import {
  listClientOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/client/lib/client-owners";
import { ProjectWorkspace } from "@/features/project/components/project-workspace";
import {
  parseProjectWorkspaceTab,
  type ProjectWorkspaceTabId,
} from "@/features/project/lib/project-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
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

  const initialTab: ProjectWorkspaceTabId = parseProjectWorkspaceTab(tab);

  const [linkedClients, vendors, owners] = await Promise.all([
    context.permissions.has("client.read")
      ? listClientsByProject(
          context.workspace.id,
          context.company.id,
          project.id,
        )
      : Promise.resolve([]),
    context.permissions.has("vendor.read")
      ? listVendorsByProject(
          context.workspace.id,
          context.company.id,
          project.id,
        ).catch(() => [])
      : Promise.resolve([]),
    listClientOwnerOptions(context.workspace.id, context.company.id),
  ]);

  return (
    <Suspense fallback={null}>
      <ProjectWorkspace
        workspaceId={context.workspace.id}
        companyId={context.company.id}
        project={project}
        clients={linkedClients}
        vendors={vendors}
        canWriteProject={context.permissions.has("project.write")}
        canWriteVendor={context.permissions.has("vendor.write")}
        canReadVendor={context.permissions.has("vendor.read")}
        canReadTimeline={context.permissions.has("timeline.read")}
        canWriteTimeline={context.permissions.has("timeline.write")}
        canReadTasks={context.permissions.has("task.read")}
        canWriteTasks={context.permissions.has("task.write")}
        canReadPackages={context.permissions.has("project.read")}
        canWritePackages={context.permissions.has("project.write")}
        coordinatorLabel={ownerLabelFromOptions(
          project.coordinator_id,
          owners,
        )}
        salesLabel={ownerLabelFromOptions(project.sales_id, owners)}
        plannerLabel={ownerLabelFromOptions(project.planner_id, owners)}
        initialTab={initialTab}
      />
    </Suspense>
  );
}
