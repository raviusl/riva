import { notFound } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { getProjectById } from "@/core/project/project";
import { listVendorAuditTrail } from "@/core/vendor/audit";
import { getVendorById } from "@/core/vendor/vendor";
import { VendorWorkspace } from "@/features/vendor/components/vendor-workspace";
import { listVendorRelatedMeetings } from "@/features/vendor/lib/vendor-related-meetings";
import {
  listVendorOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/vendor/lib/vendor-owners";
import { parseVendorWorkspaceTab } from "@/features/vendor/lib/vendor-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function VendorWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("vendor.read")) {
    notFound();
  }

  let vendor;
  try {
    vendor = await getVendorById(
      id,
      context.workspace.id,
      context.company.id,
    );
  } catch {
    notFound();
  }

  const [owners, linkedProject] = await Promise.all([
    listVendorOwnerOptions(context.workspace.id, context.company.id),
    (async () => {
      if (!vendor.project_id) return null;
      try {
        const project = await getProjectById(
          vendor.project_id,
          context.workspace.id,
        );
        return project.company_id === context.company.id ? project : null;
      } catch {
        return null;
      }
    })(),
  ]);

  const initialTab = parseVendorWorkspaceTab(query.tab);
  const meetings = await listVendorRelatedMeetings(
    context.workspace.id,
    context.company.id,
    vendor,
  );
  const activity = listVendorAuditTrail(context.company.id, vendor.id);

  return (
    <WorkspaceLayout
      backHref="/dashboard/vendors"
      backLabel={uiZh.backToList(uiZh.vendors)}
    >
      <VendorWorkspace
        workspaceId={context.workspace.id}
        companyId={context.company.id}
        vendor={vendor}
        linkedProject={linkedProject}
        ownerLabel={ownerLabelFromOptions(vendor.owner_id, owners)}
        meetings={meetings}
        activity={activity}
        canWriteVendor={context.permissions.has("vendor.write")}
        initialTab={initialTab}
      />
    </WorkspaceLayout>
  );
}
