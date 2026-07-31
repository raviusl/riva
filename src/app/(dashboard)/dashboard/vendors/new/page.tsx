import Link from "next/link";
import { redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { CreateVendorForm } from "@/features/vendor/components/create-vendor-form";
import { listVendorOwnerOptions } from "@/features/vendor/lib/vendor-owners";

type PageProps = {
  searchParams: Promise<{ projectId?: string }>;
};

export default async function NewVendorPage({ searchParams }: PageProps) {
  const context = await requireDashboardContext();
  const params = await searchParams;

  if (!context.permissions.has("vendor.write")) {
    redirect("/dashboard/vendors");
  }

  const [projects, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listVendorOwnerOptions(context.workspace.id, context.company.id),
  ]);

  const requestedProjectId = params.projectId?.trim() ?? "";
  const defaultProjectId = projects.some(
    (project) => project.id === requestedProjectId,
  )
    ? requestedProjectId
    : "";
  const returnTo = defaultProjectId
    ? `/dashboard/projects/${defaultProjectId}`
    : "/dashboard/vendors";
  const backHref = defaultProjectId
    ? `/dashboard/projects/${defaultProjectId}`
    : "/dashboard/vendors";
  const backLabel = defaultProjectId
    ? uiZh.backToList(uiZh.projects)
    : uiZh.backToList(uiZh.vendors);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href={backHref}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {backLabel}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.createVendor}</h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.addVendorTo(context.company.name)}
          {defaultProjectId ? uiZh.andAssignToProject : "。"}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateVendorForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          projects={projects}
          owners={owners}
          defaultProjectId={defaultProjectId}
          defaultOwnerId={context.userId}
          returnTo={returnTo}
        />
      </div>
    </div>
  );
}
