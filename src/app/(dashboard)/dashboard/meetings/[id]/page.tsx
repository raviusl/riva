import { notFound } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { getClientById } from "@/core/client/client";
import { listMeetingAuditTrail } from "@/core/meeting/audit";
import { getMeetingById } from "@/core/meeting/meeting";
import { getProjectById } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import { MeetingWorkspace } from "@/features/meeting/components/meeting-workspace";
import {
  listMeetingOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/meeting/lib/meeting-owners";
import { toMeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import { parseMeetingWorkspaceTab } from "@/features/meeting/lib/meeting-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function MeetingWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("meeting.read")) {
    notFound();
  }

  let meeting;
  try {
    meeting = await getMeetingById(
      id,
      context.workspace.id,
      context.company.id,
    );
  } catch {
    notFound();
  }

  const [owners, linkedProject, linkedClient, vendorNames] = await Promise.all([
    listMeetingOwnerOptions(context.workspace.id, context.company.id),
    (async () => {
      if (!meeting.project_id) return null;
      try {
        const project = await getProjectById(
          meeting.project_id,
          context.workspace.id,
        );
        return project.company_id === context.company.id ? project : null;
      } catch {
        return null;
      }
    })(),
    (async () => {
      if (!meeting.client_id) return null;
      try {
        return await getClientById(
          meeting.client_id,
          context.workspace.id,
          context.company.id,
        );
      } catch {
        return null;
      }
    })(),
    Promise.all(
      meeting.vendor_ids.map(async (vendorId) => {
        try {
          const vendor = await getVendorById(
            vendorId,
            context.workspace.id,
            context.company.id,
          );
          return vendor.name;
        } catch {
          return vendorId.slice(0, 8);
        }
      }),
    ),
  ]);

  const model = toMeetingWorkspaceModel(meeting, {
    projectName: linkedProject?.name ?? null,
    clientName: linkedClient?.name ?? null,
    vendorNames,
    ownerLabel: ownerLabelFromOptions(meeting.owner_id, owners),
  });

  const initialTab = parseMeetingWorkspaceTab(query.tab);
  const activity = listMeetingAuditTrail(context.company.id, meeting.id);

  return (
    <WorkspaceLayout
      backHref="/dashboard/meetings"
      backLabel={uiZh.backToList(uiZh.meetings)}
    >
      <MeetingWorkspace
        workspaceId={context.workspace.id}
        companyId={context.company.id}
        meeting={model}
        activity={activity}
        canWrite={context.permissions.has("meeting.write")}
        initialTab={initialTab}
      />
    </WorkspaceLayout>
  );
}
