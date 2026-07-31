"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { uiZh } from "@/config/ui-zh";
import type { AuditRecord } from "@/core/audit";
import { MeetingWorkspaceActivityPanel } from "@/features/meeting/components/meeting-workspace-activity-panel";
import { MeetingWorkspaceAgenda } from "@/features/meeting/components/meeting-workspace-agenda";
import { MeetingWorkspaceDecisions } from "@/features/meeting/components/meeting-workspace-decisions";
import { MeetingWorkspaceHeader } from "@/features/meeting/components/meeting-workspace-header";
import { MeetingWorkspaceNotes } from "@/features/meeting/components/meeting-workspace-notes";
import { MeetingWorkspaceOverview } from "@/features/meeting/components/meeting-workspace-overview";
import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import {
  DEFAULT_MEETING_WORKSPACE_TAB,
  MEETING_WORKSPACE_TABS,
  buildMeetingWorkspaceTabHref,
  parseMeetingWorkspaceTab,
  type MeetingWorkspaceTabId,
} from "@/features/meeting/lib/meeting-workspace-tabs";

type MeetingWorkspaceProps = {
  workspaceId: string;
  companyId: string;
  meeting: MeetingWorkspaceModel;
  activity: AuditRecord[];
  canWrite: boolean;
  initialTab?: MeetingWorkspaceTabId;
};

export function MeetingWorkspace({
  workspaceId,
  companyId,
  meeting,
  activity,
  canWrite,
  initialTab = DEFAULT_MEETING_WORKSPACE_TAB,
}: MeetingWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseMeetingWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseMeetingWorkspaceTab(tabId);
      return buildMeetingWorkspaceTabHref(meeting.id, tab, {
        explicitOverview: true,
      });
    },
    [meeting.id],
  );

  return (
    <div className="space-y-6">
      <MeetingWorkspaceHeader
        workspaceId={workspaceId}
        companyId={companyId}
        meeting={meeting}
        canWrite={canWrite}
      />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={MEETING_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <MeetingWorkspaceOverview meeting={meeting} />
        ) : null}

        {activeTab === "agenda" ? (
          <MeetingWorkspaceAgenda items={meeting.agenda} />
        ) : null}

        {activeTab === "notes" ? (
          <MeetingWorkspaceNotes initialNotes={meeting.notes} />
        ) : null}

        {activeTab === "decisions" ? (
          <MeetingWorkspaceDecisions decisions={meeting.decisions} />
        ) : null}

        {activeTab === "attachments" ? (
          <WorkspaceComingSoon
            title={uiZh.attachments}
            description={uiZh.attachmentsSoon}
          />
        ) : null}

        {activeTab === "activity" ? (
          <MeetingWorkspaceActivityPanel records={activity} />
        ) : null}
      </div>
    </div>
  );
}
