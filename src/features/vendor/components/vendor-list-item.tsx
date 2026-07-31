"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import {
  archiveVendorAction,
  deactivateVendorAction,
  restoreVendorAction,
} from "@/core/actions/vendor-actions";
import type { Vendor } from "@/core/types";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

type VendorListItemProps = {
  workspaceId: string;
  companyId: string;
  vendor: Vendor;
  canWrite: boolean;
  projectName?: string | null;
  ownerName?: string | null;
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

export function VendorListItem({
  workspaceId,
  companyId,
  vendor,
  canWrite,
  projectName,
  ownerName = null,
}: VendorListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const workspaceHref = buildWorkspaceOverviewHref("vendor", vendor.id);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={workspaceHref}
            className="truncate text-sm font-medium text-white hover:text-white/80"
          >
            {vendor.name}
          </Link>
          <p className="mt-1 truncate text-xs text-white/45">
            {vendorCategoryLabel(vendor.category)} · {statusLabel(vendor.status)}
            {ownerName ? ` · ${ownerName}` : ""}
            {vendor.contact_person ? ` · ${vendor.contact_person}` : ""}
            {vendor.email ? ` · ${vendor.email}` : ""}
            {vendor.phone ? ` · ${vendor.phone}` : ""}
          </p>
          {vendor.project_id && projectName ? (
            <Link
              href={buildWorkspaceOverviewHref("project", vendor.project_id)}
              className="mt-1 inline-block truncate text-xs text-white/40 hover:text-white/70"
            >
              {uiZh.projectPrefix} {projectName}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => router.push(workspaceHref)}
          >
            {uiZh.open}
          </Button>
          {canWrite ? (
            <>
              {vendor.status !== "archived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    router.push(`/dashboard/vendors/${vendor.id}/edit`)
                  }
                >
                  {uiZh.edit}
                </Button>
              ) : null}
              {vendor.status === "active" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await deactivateVendorAction({
                        workspaceId,
                        companyId,
                        vendorId: vendor.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.vendorDeactivated);
                      router.refresh();
                    });
                  }}
                >
                  {uiZh.deactivate}
                </Button>
              ) : null}
              {vendor.status !== "archived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await archiveVendorAction({
                        workspaceId,
                        companyId,
                        vendorId: vendor.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.vendorArchived);
                      router.refresh();
                    });
                  }}
                >
                  {uiZh.archive}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await restoreVendorAction({
                        workspaceId,
                        companyId,
                        vendorId: vendor.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.vendorRestored);
                      router.refresh();
                    });
                  }}
                >
                  {uiZh.restore}
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
