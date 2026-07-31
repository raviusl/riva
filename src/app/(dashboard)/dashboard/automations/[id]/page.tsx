import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { requireDashboardContext } from "@/core/auth/context";
import { AutomationWorkspace } from "@/features/automation/components/automation-workspace";
import { getAutomationWorkspacePreview } from "@/features/automation/lib/automation-workspace-preview";
import { parseAutomationWorkspaceTab } from "@/features/automation/lib/automation-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function AutomationWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  await requireDashboardContext();

  const automation = getAutomationWorkspacePreview(id.trim() || "preview");
  const initialTab = parseAutomationWorkspaceTab(query.tab);

  return (
    <WorkspaceLayout
      backHref="/dashboard/automations"
      backLabel="← Automations"
    >
      <AutomationWorkspace automation={automation} initialTab={initialTab} />
    </WorkspaceLayout>
  );
}
