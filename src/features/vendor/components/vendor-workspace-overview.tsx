import Link from "next/link";

import { formatProjectStatus } from "@/components/projects/project-labels";
import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { uiZh } from "@/config/ui-zh";
import type { Project, Vendor } from "@/core/types";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";

type VendorWorkspaceOverviewProps = {
  vendor: Vendor;
  linkedProject: Project | null;
  ownerLabel: string | null;
  canWriteVendor: boolean;
};

function statusLabel(status: Vendor["status"]) {
  switch (status) {
    case "active":
      return uiZh.active;
    case "inactive":
      return uiZh.inactive;
    case "archived":
      return uiZh.archived;
    default:
      return status;
  }
}

function projectStatusLabel(status: Project["status"]) {
  return formatProjectStatus(status);
}

function formatDate(value: string | null) {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

export function VendorWorkspaceOverview({
  vendor,
  linkedProject,
  ownerLabel,
  canWriteVendor,
}: VendorWorkspaceOverviewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">
              {uiZh.vendorDetails}
            </h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.vendorDetailsDesc}
            </p>
          </div>
          {canWriteVendor && vendor.status !== "archived" ? (
            <Link
              href={`/dashboard/vendors/${vendor.id}/edit`}
              className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
            >
              {uiZh.editDetails}
            </Link>
          ) : null}
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label={uiZh.name} value={vendor.name} />
          <InfoRow
            label={uiZh.companyName}
            value={vendor.company_name?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.contactPerson}
            value={vendor.contact_person?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.category}
            value={vendorCategoryLabel(vendor.category)}
          />
          <InfoRow label={uiZh.status} value={statusLabel(vendor.status)} />
          <InfoRow
            label={uiZh.owner}
            value={ownerLabel?.trim() || uiZh.unassigned}
          />
          <InfoRow
            label={uiZh.email}
            value={vendor.email?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.phone}
            value={vendor.phone?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.website}
            value={vendor.website?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.address}
            value={vendor.address?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.notes}
            value={vendor.notes?.trim() || uiZh.emDash}
          />
          <InfoRow
            label={uiZh.updated}
            value={formatDate(vendor.updated_at)}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.linkedProject}</h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.linkedProjectDesc}</p>
        {linkedProject ? (
          <WorkspaceEntityLink
            kind="project"
            id={linkedProject.id}
            className="mt-4 block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
          >
            <p className="truncate text-sm text-white">{linkedProject.name}</p>
            <p className="mt-1 text-xs text-white/40">
              {projectStatusLabel(linkedProject.status)}
              {linkedProject.project_type
                ? ` · ${linkedProject.project_type}`
                : ""}
            </p>
          </WorkspaceEntityLink>
        ) : (
          <p className="mt-4 text-sm text-white/45">{uiZh.noProjectLinked}</p>
        )}
      </section>
    </div>
  );
}
