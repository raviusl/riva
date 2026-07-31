import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { VendorListItem } from "@/features/vendor/components/vendor-list-item";
import {
  listVendorOwnerOptions,
  ownerLabelFromOptions,
} from "@/features/vendor/lib/vendor-owners";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function VendorsPage({ searchParams }: PageProps) {
  const context = await requireDashboardContext();
  const params = await searchParams;

  if (!context.permissions.has("vendor.read")) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        {uiZh.noPermissionVendors}
      </div>
    );
  }

  const [vendors, projects, owners] = await Promise.all([
    listVendorsByCompany(context.workspace.id, context.company.id),
    listProjectsByCompany(context.workspace.id, context.company.id),
    listVendorOwnerOptions(context.workspace.id, context.company.id),
  ]);
  const canWrite = context.permissions.has("vendor.write");
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  const statusFilter = params.status?.trim() || "active";
  const visible = vendors.filter((vendor) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "archived") return vendor.status === "archived";
    if (statusFilter === "inactive") return vendor.status === "inactive";
    return vendor.status === "active";
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">{uiZh.vendors}</h1>
          <p className="mt-2 text-sm text-white/45">
            {uiZh.vendorCrmFor}{" "}
            <span className="text-white/70">{context.company.name}</span>
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/vendors/new"
            className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            {uiZh.create}
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {(
          [
            { id: "active", label: uiZh.active },
            { id: "inactive", label: uiZh.inactive },
            { id: "archived", label: uiZh.archived },
            { id: "all", label: uiZh.all },
          ] as const
        ).map((filter) => {
          const href =
            filter.id === "active"
              ? "/dashboard/vendors"
              : `/dashboard/vendors?status=${filter.id}`;
          const active = statusFilter === filter.id;
          return (
            <Link
              key={filter.id}
              href={href}
              className={
                active
                  ? "rounded-lg border border-white/20 bg-white/[0.06] px-3 py-1.5 text-white"
                  : "rounded-lg border border-white/10 px-3 py-1.5 text-white/45 hover:text-white/70"
              }
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <ModuleEmptyState
          title={uiZh.noVendorsYet}
          description={uiZh.addVendorsDesc}
          actionHref={canWrite ? "/dashboard/vendors/new" : undefined}
          actionLabel={canWrite ? uiZh.createVendor : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((vendor) => (
            <li key={vendor.id}>
              <VendorListItem
                workspaceId={context.workspace.id}
                companyId={context.company.id}
                vendor={vendor}
                canWrite={canWrite}
                projectName={
                  vendor.project_id
                    ? (projectNames.get(vendor.project_id) ?? null)
                    : null
                }
                ownerName={ownerLabelFromOptions(vendor.owner_id, owners)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
