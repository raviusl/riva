"use client";

import {
  WorkspaceHeader,
} from "@/components/layout/workspace-header";
import type { TimelineWorkspaceModel } from "@/features/timeline/lib/timeline-types";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type TimelineWorkspaceHeaderProps = {
  workspace: TimelineWorkspaceModel;
};

export function TimelineWorkspaceHeader({
  workspace,
}: TimelineWorkspaceHeaderProps) {
  const total = workspace.feed.items.length;

  return (
    <WorkspaceHeader
      eyebrow={uiZh.timelineWorkspaceEyebrow}
      title={workspace.title}
      status={{
        label: `${total} events`,
        tone: total > 0 ? "info" : "default",
      }}
      lifecycle={workspace.description}
      breadcrumbs={buildWorkspaceBreadcrumbs("timeline")}
    />
  );
}
