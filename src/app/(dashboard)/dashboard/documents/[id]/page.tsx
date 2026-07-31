import { redirect } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { requireDashboardContext } from "@/core/auth/context";
import { DocumentWorkspace } from "@/features/document/components/document-workspace";
import { getDocumentWorkspacePreview } from "@/features/document/lib/document-workspace-preview";
import {
  DOCUMENT_WORKSPACE_HUB_ID,
  buildDocumentWorkspaceTabHref,
  parseDocumentWorkspaceTab,
} from "@/features/document/lib/document-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function DocumentWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireDashboardContext();

  const hubId = id.trim() || DOCUMENT_WORKSPACE_HUB_ID;
  const initialTab = parseDocumentWorkspaceTab(query.tab);

  if (hubId !== DOCUMENT_WORKSPACE_HUB_ID) {
    redirect(
      buildDocumentWorkspaceTabHref(DOCUMENT_WORKSPACE_HUB_ID, initialTab, {
        explicitOverview: true,
      }),
    );
  }

  const model = getDocumentWorkspacePreview(DOCUMENT_WORKSPACE_HUB_ID);

  return (
    <WorkspaceLayout backHref="/dashboard/documents" backLabel="← Documents">
      <DocumentWorkspace model={model} initialTab={initialTab} />
    </WorkspaceLayout>
  );
}
