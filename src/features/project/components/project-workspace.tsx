"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import type { Client, Project, Vendor } from "@/core/types";
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
import { WeddingPackageManager } from "@/features/wedding-package";
import { WeddingTaskManager } from "@/features/wedding-task";
import { WeddingTimelineBuilder } from "@/features/wedding-timeline";
import { uiZh } from "@/config/ui-zh";

type ProjectWorkspaceProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  clients: Client[];
  vendors: Vendor[];
  canWriteProject: boolean;
  canWriteVendor: boolean;
  canReadVendor: boolean;
  canReadTimeline?: boolean;
  canWriteTimeline?: boolean;
  canReadTasks?: boolean;
  canWriteTasks?: boolean;
  canReadPackages?: boolean;
  canWritePackages?: boolean;
  coordinatorLabel?: string | null;
  salesLabel?: string | null;
  plannerLabel?: string | null;
  initialTab?: ProjectWorkspaceTabId;
};

export function ProjectWorkspace({
  workspaceId,
  companyId,
  project,
  clients,
  vendors,
  canWriteProject,
  canWriteVendor,
  canReadVendor,
  canReadTimeline = false,
  canWriteTimeline = false,
  canReadTasks = false,
  canWriteTasks = false,
  canReadPackages = false,
  canWritePackages = false,
  coordinatorLabel,
  salesLabel,
  plannerLabel,
  initialTab = DEFAULT_PROJECT_WORKSPACE_TAB,
}: ProjectWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseProjectWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseProjectWorkspaceTab(tabId);
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
            canWriteProject={canWriteProject}
            coordinatorLabel={coordinatorLabel}
            salesLabel={salesLabel}
            plannerLabel={plannerLabel}
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
            <div className="space-y-8">
              <WeddingTimelineBuilder
                workspaceId={workspaceId}
                companyId={companyId}
                project={project}
                vendors={vendors}
                canWrite={canWriteTimeline}
                coupleName={
                  clients[0]?.display_name ||
                  [clients[0]?.bride_name, clients[0]?.groom_name]
                    .filter(Boolean)
                    .join(" & ") ||
                  clients[0]?.name ||
                  null
                }
              />
              {/* Keep lifecycle engine available as secondary reference */}
              <details className="rounded-2xl border border-white/[0.06] px-4 py-3">
                <summary className="cursor-pointer text-xs text-white/40">
                  {uiZh.timeline} · Lifecycle
                </summary>
                <div className="mt-4">
                  <ProjectTimelineEnginePanel
                    workspaceId={workspaceId}
                    companyId={companyId}
                    projectId={project.id}
                  />
                </div>
              </details>
            </div>
          ) : (
            <WorkspaceComingSoon
              title={uiZh.timeline}
              description={uiZh.tlNoPermission}
            />
          )
        ) : null}

        {activeTab === "tasks" ? (
          canReadTasks ? (
            <WeddingTaskManager
              workspaceId={workspaceId}
              companyId={companyId}
              project={project}
              clients={clients}
              vendors={vendors}
              canWrite={canWriteTasks}
            />
          ) : (
            <WorkspaceComingSoon
              title={uiZh.tasks}
              description={uiZh.wtNoPermission}
            />
          )
        ) : null}

        {activeTab === "meetings" ? (
          <WorkspaceComingSoon
            title={uiZh.meetings}
            description={uiZh.comingSoonModule}
          />
        ) : null}

        {activeTab === "schedule" ? (
          <WorkspaceComingSoon
            title={uiZh.schedule}
            description={uiZh.comingSoonModule}
          />
        ) : null}

        {activeTab === "package" ? (
          canReadPackages ? (
            <WeddingPackageManager
              workspaceId={workspaceId}
              companyId={companyId}
              project={project}
              vendors={vendors}
              canWrite={canWritePackages}
            />
          ) : (
            <WorkspaceComingSoon
              title={uiZh.packageTab}
              description={uiZh.wpNoPermission}
            />
          )
        ) : null}

        {activeTab === "documents" ? (
          <WorkspaceComingSoon
            title={uiZh.documents}
            description={uiZh.comingSoonModule}
          />
        ) : null}

        {activeTab === "gallery" ? (
          <WorkspaceComingSoon
            title={uiZh.gallery}
            description={uiZh.comingSoonModule}
          />
        ) : null}

        {activeTab === "notes" ? (
          <WorkspaceComingSoon
            title={uiZh.notes}
            description={uiZh.comingSoonModule}
          />
        ) : null}

        {activeTab === "finance" ? (
          <WorkspaceComingSoon
            title={uiZh.financeComingSoon}
            description={uiZh.comingSoonModule}
          />
        ) : null}
      </div>
    </div>
  );
}
