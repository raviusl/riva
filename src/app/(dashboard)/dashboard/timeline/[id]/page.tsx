import { notFound, redirect } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { requireDashboardContext } from "@/core/auth/context";
import { aggregateTimelineFeed } from "@/core/timeline/aggregate";
import { TimelineWorkspace } from "@/features/timeline/components/timeline-workspace";
import type { TimelineWorkspaceModel } from "@/features/timeline/lib/timeline-types";
import {
  TIMELINE_WORKSPACE_HUB_ID,
  buildTimelineWorkspaceTabHref,
  parseTimelineWorkspaceTab,
} from "@/features/timeline/lib/timeline-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TimelineWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireDashboardContext();

  const hubId = id.trim() || TIMELINE_WORKSPACE_HUB_ID;
  const initialTab = parseTimelineWorkspaceTab(query.tab);

  if (hubId !== TIMELINE_WORKSPACE_HUB_ID) {
    redirect(
      buildTimelineWorkspaceTabHref(TIMELINE_WORKSPACE_HUB_ID, initialTab, {
        explicitOverview: true,
      }),
    );
  }

  const feed = await aggregateTimelineFeed({
    workspaceId: context.workspace.id,
    companyId: context.company.id,
  });

  if (!feed) {
    notFound();
  }

  const model: TimelineWorkspaceModel = {
    id: TIMELINE_WORKSPACE_HUB_ID,
    title: "Timeline Workspace",
    description: `Chronological feed for ${context.company.name}`,
    workspaceId: context.workspace.id,
    companyId: context.company.id,
    feed,
  };

  return (
    <WorkspaceLayout backHref="/dashboard/timeline" backLabel="← Timeline">
      <TimelineWorkspace model={model} initialTab={initialTab} />
    </WorkspaceLayout>
  );
}
