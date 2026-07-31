import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { uiZh } from "@/config/ui-zh";

export function TaskWorkspaceChecklistPanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.checklist}
      description={uiZh.checklistSoonDesc}
    />
  );
}

export function TaskWorkspaceAttachmentsPanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.attachments}
      description={uiZh.attachmentsSoonDesc}
    />
  );
}
