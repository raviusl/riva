"use client";

import {
  WorkspaceHeader,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import type { DocumentWorkspaceModel } from "@/features/document/lib/document-types";
import { formatDocumentBytes } from "@/features/document/lib/document-labels";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type DocumentWorkspaceHeaderProps = {
  workspace: DocumentWorkspaceModel;
};

export function DocumentWorkspaceHeader({
  workspace,
}: DocumentWorkspaceHeaderProps) {
  const count = workspace.documents.length;
  const status: WorkspaceHeaderStatus = {
    label: `${count} document${count === 1 ? "" : "s"}`,
    tone: count > 0 ? "info" : "default",
  };

  return (
    <WorkspaceHeader
      eyebrow={uiZh.documentWorkspaceEyebrow}
      title={workspace.title}
      status={status}
      lifecycle={`${formatDocumentBytes(workspace.totalStorageBytes)} · ${workspace.description}`}
      breadcrumbs={buildWorkspaceBreadcrumbs("document")}
    />
  );
}
