import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { DOCUMENT_WORKSPACE_HUB_ID } from "@/features/document/lib/document-workspace-tabs";
import { buildDocumentWorkspaceTabHref } from "@/features/document/lib/document-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export default async function DocumentsPage() {
  await requireDashboardContext();

  const workspaceHref = buildWorkspaceOverviewHref(
    "document",
    DOCUMENT_WORKSPACE_HUB_ID,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.documentsPageTitle}</h1>
          <p className="mt-2 text-sm text-white/45">{uiZh.documentsPageDesc}</p>
        </div>
        <Link
          href={workspaceHref}
          className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {uiZh.openWorkspace}
        </Link>
      </div>

      <ModuleEmptyState
        title={uiZh.documentWorkspaceTitle}
        description={uiZh.documentWorkspaceEmptyDesc}
        actionHref={workspaceHref}
        actionLabel={uiZh.openDocumentWorkspace}
      />

      <p className="text-center text-xs text-white/35">
        {uiZh.orOpen}{" "}
        <Link
          href={buildDocumentWorkspaceTabHref(
            DOCUMENT_WORKSPACE_HUB_ID,
            "documents",
          )}
          className="text-white/55 hover:text-white/80"
        >
          /dashboard/documents/workspace?tab=documents
        </Link>
      </p>
    </div>
  );
}
