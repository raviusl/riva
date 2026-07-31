import { redirect } from "next/navigation";

import { WorkspaceSettingsForm } from "@/features/workspace/components/workspace-settings-form";
import { WorkspaceSettingsSection } from "@/features/settings/components/sections/workspace-settings-section";
import { SettingsShell } from "@/features/settings/components/settings-shell";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";

export default async function WorkspaceSettingsPage() {
  const { context, activeWorkspace } = await loadSettingsPageContext();

  if (!activeWorkspace) {
    redirect("/dashboard/workspaces/new");
  }

  return (
    <SettingsShell
      activeSection="workspace"
      workspaceName={context.workspaceName}
      companyName={context.companyName}
    >
      <WorkspaceSettingsSection
        workspaceName={activeWorkspace.name}
        canWrite={context.canWriteWorkspace}
      >
        <WorkspaceSettingsForm
          workspace={activeWorkspace}
          canWrite={context.canWriteWorkspace}
        />
      </WorkspaceSettingsSection>
    </SettingsShell>
  );
}
