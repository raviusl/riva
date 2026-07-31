import { WorkspaceComingSoon } from "@/components/layout/workspace-coming-soon";
import { uiZh } from "@/config/ui-zh";

export function VendorWorkspaceDocumentsPanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.relatedDocuments}
      description={uiZh.vendorDocumentsSoon}
    />
  );
}

export function VendorWorkspaceTimelinePanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.relatedTimeline}
      description={uiZh.vendorTimelineSoon}
    />
  );
}

export function VendorWorkspaceFinancePanel() {
  return (
    <WorkspaceComingSoon
      title={uiZh.relatedFinance}
      description={uiZh.vendorFinanceSoon}
    />
  );
}
