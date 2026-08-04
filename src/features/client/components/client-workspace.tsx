"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import type { AuditRecord } from "@/core/audit";
import type { Client, Project } from "@/core/types";
import { ClientWorkspaceActivityPanel } from "@/features/client/components/client-workspace-activity-panel";
import { ClientWorkspaceHeader } from "@/features/client/components/client-workspace-header";
import { ClientWorkspaceMeetingsPanel } from "@/features/client/components/client-workspace-meetings-panel";
import { ClientWorkspaceNotesPanel } from "@/features/client/components/client-workspace-notes-panel";
import { ClientWorkspaceOverview } from "@/features/client/components/client-workspace-overview";
import { ClientWorkspaceProjectsPanel } from "@/features/client/components/client-workspace-projects-panel";
import {
  ClientWorkspaceDocumentsPanel,
  ClientWorkspaceFinancePanel,
  ClientWorkspaceTimelinePanel,
} from "@/features/client/components/client-workspace-placeholders";
import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import {
  CLIENT_WORKSPACE_TABS,
  DEFAULT_CLIENT_WORKSPACE_TAB,
  buildClientWorkspaceTabHref,
  parseClientWorkspaceTab,
  type ClientWorkspaceTabId,
} from "@/features/client/lib/client-workspace-tabs";

type ClientWorkspaceProps = {
  workspaceId: string;
  companyId: string;
  client: Client;
  linkedProject: Project | null;
  projects: Project[];
  ownerLabel: string | null;
  picLabel?: string | null;
  meetings: MeetingWorkspaceModel[];
  activity: AuditRecord[];
  canWriteClient: boolean;
  canWriteProject?: boolean;
  initialTab?: ClientWorkspaceTabId;
};

export function ClientWorkspace({
  workspaceId,
  companyId,
  client,
  linkedProject,
  projects,
  ownerLabel,
  picLabel,
  meetings,
  activity,
  canWriteClient,
  canWriteProject = false,
  initialTab = DEFAULT_CLIENT_WORKSPACE_TAB,
}: ClientWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseClientWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseClientWorkspaceTab(tabId);
      return buildClientWorkspaceTabHref(client.id, tab, {
        explicitOverview: true,
      });
    },
    [client.id],
  );

  return (
    <div className="space-y-6">
      <ClientWorkspaceHeader
        workspaceId={workspaceId}
        companyId={companyId}
        client={client}
        canWriteClient={canWriteClient}
      />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={CLIENT_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <ClientWorkspaceOverview
            client={client}
            linkedProject={linkedProject}
            ownerLabel={ownerLabel}
            picLabel={picLabel}
            canWriteClient={canWriteClient}
          />
        ) : null}

        {activeTab === "projects" ? (
          <ClientWorkspaceProjectsPanel
            client={client}
            projects={projects}
            canWriteProject={canWriteProject}
          />
        ) : null}

        {activeTab === "meetings" ? (
          <ClientWorkspaceMeetingsPanel meetings={meetings} />
        ) : null}

        {activeTab === "documents" ? <ClientWorkspaceDocumentsPanel /> : null}

        {activeTab === "timeline" ? <ClientWorkspaceTimelinePanel /> : null}

        {activeTab === "finance" ? <ClientWorkspaceFinancePanel /> : null}

        {activeTab === "activity" ? (
          <ClientWorkspaceActivityPanel records={activity} />
        ) : null}

        {activeTab === "notes" ? (
          <ClientWorkspaceNotesPanel
            client={client}
            canWriteClient={canWriteClient}
          />
        ) : null}
      </div>
    </div>
  );
}
