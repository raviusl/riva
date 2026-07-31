"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import type { Client, Project, Vendor } from "@/core/types";
import { ProjectWorkspaceClientsPanel } from "@/features/project/components/project-workspace-clients-panel";
import { ProjectWorkspaceHeader } from "@/features/project/components/project-workspace-header";
import { ProjectWorkspaceOverview } from "@/features/project/components/project-workspace-overview";
import { ProjectWorkspaceVendorsPanel } from "@/features/project/components/project-workspace-vendors-panel";
import {
  DEFAULT_PROJECT_WORKSPACE_TAB,
  PROJECT_WORKSPACE_TABS,
  buildProjectWorkspaceTabHref,
  parseProjectWorkspaceTab,
  type ProjectWorkspaceTabId,
} from "@/features/project/lib/project-workspace-tabs";
import { ProjectTimelineEnginePanel } from "@/features/timeline-engine";
import { uiZh } from "@/config/ui-zh";

type ProjectWorkspaceProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  clients: Client[];
  vendors: Vendor[];
  canWriteProject: boolean;
  canWriteClient: boolean;
  canWriteVendor: boolean;
  canReadClient: boolean;
  canReadVendor: boolean;
  canReadTimeline?: boolean;
  /** Server-parsed tab from the request URL (SSR + refresh). */
  initialTab?: ProjectWorkspaceTabId;
};

export function ProjectWorkspace({
  workspaceId,
  companyId,
  project,
  clients,
  vendors,
  canWriteProject,
  canWriteClient,
  canWriteVendor,
  canReadClient,
  canReadVendor,
  canReadTimeline = false,
  initialTab = DEFAULT_PROJECT_WORKSPACE_TAB,
}: ProjectWorkspaceProps) {
  const searchParams = useSearchParams();
  // Prefer live URL so back/forward and deep-links update without remount.
  const activeTab = parseProjectWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseProjectWorkspaceTab(tabId);
      // Keep ?tab=overview shareable; bare URL still opens Overview.
      return buildProjectWorkspaceTabHref(project.id, tab, {
        explicitOverview: true,
      });
    },
    [project.id],
  );

  return (
    <div className="space-y-6">
      <ProjectWorkspaceHeader
        workspaceId={workspaceId}
        companyId={companyId}
        project={project}
        canWriteProject={canWriteProject}
      />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={PROJECT_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <ProjectWorkspaceOverview
            project={project}
            clients={clients}
            vendors={vendors}
            canWriteClient={canWriteClient}
            canWriteVendor={canWriteVendor}
            canReadClient={canReadClient}
            canReadVendor={canReadVendor}
          />
        ) : null}

        {activeTab === "clients" ? (
          <ProjectWorkspaceClientsPanel
            project={project}
            clients={clients}
            canWriteClient={canWriteClient}
            canReadClient={canReadClient}
          />
        ) : null}

        {activeTab === "vendors" ? (
          <ProjectWorkspaceVendorsPanel
            project={project}
            vendors={vendors}
            canWriteVendor={canWriteVendor}
            canReadVendor={canReadVendor}
          />
        ) : null}

        {activeTab === "timeline" ? (
          canReadTimeline ? (
            <ProjectTimelineEnginePanel
              workspaceId={workspaceId}
              companyId={companyId}
              projectId={project.id}
            />
          ) : (
            <WorkspaceComingSoon
              title={uiZh.timeline}
              description={uiZh.projectTimelineSoon}
            />
          )
        ) : null}

        {activeTab === "documents" ? (
          <WorkspaceComingSoon
            title={uiZh.documents}
            description={uiZh.projectDocumentsSoon}
          />
        ) : null}

        {activeTab === "finance" ? (
          <WorkspaceComingSoon
            title={uiZh.finance}
            description={uiZh.projectFinanceSoon}
          />
        ) : null}

        {activeTab === "tasks" ? (
          <WorkspaceComingSoon
            title={uiZh.tasks}
            description={uiZh.projectTasksSoonPlaceholder}
          />
        ) : null}

        {activeTab === "activity" ? (
          <WorkspaceComingSoon
            title={uiZh.activity}
            description={uiZh.projectActivitySoonPlaceholder}
          />
        ) : null}
      </div>
    </div>
  );
}
