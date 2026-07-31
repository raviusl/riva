"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { WorkspaceTabNav } from "@/components/layout/workspace-tab-nav";
import { DocumentWorkspaceActivityPanel } from "@/features/document/components/document-workspace-activity-panel";
import { DocumentWorkspaceDocumentsPanel } from "@/features/document/components/document-workspace-documents-panel";
import { DocumentWorkspaceFoldersPanel } from "@/features/document/components/document-workspace-folders-panel";
import { DocumentWorkspaceHeader } from "@/features/document/components/document-workspace-header";
import { DocumentWorkspaceOverview } from "@/features/document/components/document-workspace-overview";
import { DocumentWorkspaceVersionsPanel } from "@/features/document/components/document-workspace-versions-panel";
import type { DocumentWorkspaceModel } from "@/features/document/lib/document-types";
import {
  DEFAULT_DOCUMENT_WORKSPACE_TAB,
  DOCUMENT_WORKSPACE_TABS,
  buildDocumentWorkspaceTabHref,
  parseDocumentWorkspaceTab,
  type DocumentWorkspaceTabId,
} from "@/features/document/lib/document-workspace-tabs";

type DocumentWorkspaceProps = {
  model: DocumentWorkspaceModel;
  initialTab?: DocumentWorkspaceTabId;
};

export function DocumentWorkspace({
  model,
  initialTab = DEFAULT_DOCUMENT_WORKSPACE_TAB,
}: DocumentWorkspaceProps) {
  const searchParams = useSearchParams();
  const activeTab = parseDocumentWorkspaceTab(
    searchParams.get("tab") ?? initialTab,
  );

  const hrefForTab = useCallback(
    (tabId: string) => {
      const tab = parseDocumentWorkspaceTab(tabId);
      return buildDocumentWorkspaceTabHref(model.id, tab, {
        explicitOverview: true,
      });
    },
    [model.id],
  );

  return (
    <div className="space-y-6">
      <DocumentWorkspaceHeader workspace={model} />

      <div className="space-y-5">
        <WorkspaceTabNav
          tabs={DOCUMENT_WORKSPACE_TABS}
          activeTab={activeTab}
          hrefForTab={hrefForTab}
        />

        {activeTab === "overview" ? (
          <DocumentWorkspaceOverview workspace={model} />
        ) : null}

        {activeTab === "documents" ? (
          <DocumentWorkspaceDocumentsPanel documents={model.documents} />
        ) : null}

        {activeTab === "folders" ? (
          <DocumentWorkspaceFoldersPanel
            folders={model.folders}
            documents={model.documents}
          />
        ) : null}

        {activeTab === "versions" ? (
          <DocumentWorkspaceVersionsPanel versions={model.versions} />
        ) : null}

        {activeTab === "activity" ? (
          <DocumentWorkspaceActivityPanel activities={model.activities} />
        ) : null}
      </div>
    </div>
  );
}
