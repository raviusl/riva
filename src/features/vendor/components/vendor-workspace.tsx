"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { WorkspaceLinkedProjectPanel } from "@/components/layout/workspace-linked-project-panel";
import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { uiZh } from "@/config/ui-zh";
import type { AuditRecord } from "@/core/audit";
import type { Project, Vendor } from "@/core/types";
import { VendorWorkspaceActivityPanel } from "@/features/vendor/components/vendor-workspace-activity-panel";
import { VendorWorkspaceHeader } from "@/features/vendor/components/vendor-workspace-header";
import { VendorWorkspaceMeetingsPanel } from "@/features/vendor/components/vendor-workspace-meetings-panel";
import { VendorWorkspaceNotesPanel } from "@/features/vendor/components/vendor-workspace-notes-panel";
import { VendorWorkspaceOverview } from "@/features/vendor/components/vendor-workspace-overview";
import {
  VendorWorkspaceDocumentsPanel,
  VendorWorkspaceFinancePanel,
  VendorWorkspaceTimelinePanel,
} from "@/features/vendor/components/vendor-workspace-placeholders";
import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import {
  DEFAULT_VENDOR_WORKSPACE_TAB,
  VENDOR_WORKSPACE_TABS,
  buildVendorWorkspaceTabHref,
  parseVendorWorkspaceTab,
  type VendorWorkspaceTabId,
} from "@/features/vendor/lib/vendor-workspace-tabs";

type VendorWorkspaceProps = {
  workspaceId: string;
  companyId: string;
  vendor: Vendor;
  linkedProject: Project | null;
  ownerLabel: string | null;
  meetings: MeetingWorkspaceModel[];
  activity: AuditRecord[];
  canWriteVendor: boolean;
  initialTab?: VendorWorkspaceTabId;
};

export function VendorWorkspace({
  workspaceId,
  companyId,
  vendor,
  linkedProject,
  ownerLabel,
  meetings,
  activity,
  canWriteVendor,
  initialTab = DEFAULT_VENDOR_WORKSPACE_TAB,
}: VendorWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseVendorWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseVendorWorkspaceTab(tabId);
      return buildVendorWorkspaceTabHref(vendor.id, tab, {
        explicitOverview: true,
      });
    },
    [vendor.id],
  );

  return (
    <div className="space-y-6">
      <VendorWorkspaceHeader
        workspaceId={workspaceId}
        companyId={companyId}
        vendor={vendor}
        canWriteVendor={canWriteVendor}
      />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={VENDOR_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <VendorWorkspaceOverview
            vendor={vendor}
            linkedProject={linkedProject}
            ownerLabel={ownerLabel}
            canWriteVendor={canWriteVendor}
          />
        ) : null}

        {activeTab === "projects" ? (
          <WorkspaceLinkedProjectPanel
            linkedProject={linkedProject}
            emptyDescription={uiZh.linkVendorToProjectHint}
          />
        ) : null}

        {activeTab === "meetings" ? (
          <VendorWorkspaceMeetingsPanel meetings={meetings} />
        ) : null}

        {activeTab === "documents" ? <VendorWorkspaceDocumentsPanel /> : null}

        {activeTab === "timeline" ? <VendorWorkspaceTimelinePanel /> : null}

        {activeTab === "finance" ? <VendorWorkspaceFinancePanel /> : null}

        {activeTab === "activity" ? (
          <VendorWorkspaceActivityPanel records={activity} />
        ) : null}

        {activeTab === "notes" ? (
          <VendorWorkspaceNotesPanel
            vendor={vendor}
            canWriteVendor={canWriteVendor}
          />
        ) : null}
      </div>
    </div>
  );
}
