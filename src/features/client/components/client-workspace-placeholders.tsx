import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { uiZh } from "@/config/ui-zh";

export function ClientWorkspaceDocumentsPanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.relatedDocuments}
      description={uiZh.clientDocumentsSoon}
    />
  );
}

export function ClientWorkspaceTimelinePanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.relatedTimeline}
      description={uiZh.clientTimelineSoon}
    />
  );
}

export function ClientWorkspaceFinancePanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.relatedFinance}
      description={uiZh.clientFinanceSoon}
    />
  );
}
