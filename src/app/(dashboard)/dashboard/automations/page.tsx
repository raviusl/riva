import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { AUTOMATION_WORKSPACE_PREVIEW_ID } from "@/features/automation/lib/automation-workspace-tabs";
import { buildAutomationWorkspaceTabHref } from "@/features/automation/lib/automation-workspace-tabs";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export default async function AutomationsPage() {
  await requireDashboardContext();

  const previewHref = buildWorkspaceOverviewHref(
    "automation",
    AUTOMATION_WORKSPACE_PREVIEW_ID,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.automationsPageTitle}</h1>
          <p className="mt-2 text-sm text-white/45">{uiZh.automationsPageDesc}</p>
        </div>
        <Link
          href={previewHref}
          className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {uiZh.openPreviewWorkspace}
        </Link>
      </div>

      <ModuleEmptyState
        title={uiZh.automationWorkspaceTitle}
        description={uiZh.automationWorkspaceEmptyDesc}
        actionHref={previewHref}
        actionLabel={uiZh.openAutomationWorkspace}
      />

      <p className="text-center text-xs text-white/35">
        {uiZh.orOpen}{" "}
        <Link
          href={buildAutomationWorkspaceTabHref(
            AUTOMATION_WORKSPACE_PREVIEW_ID,
            "workflow",
          )}
          className="text-white/55 hover:text-white/80"
        >
          /dashboard/automations/preview?tab=workflow
        </Link>
      </p>
    </div>
  );
}
