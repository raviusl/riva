"use client";

import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import {
  WorkspaceHeader,
  type WorkspaceHeaderAction,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import { uiZh } from "@/config/ui-zh";
import {
  archiveVendorAction,
  deactivateVendorAction,
  restoreVendorAction,
} from "@/core/actions/vendor-actions";
import type { Vendor } from "@/core/types";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";

type VendorWorkspaceHeaderProps = {
  workspaceId: string;
  companyId: string;
  vendor: Vendor;
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

function vendorStatusTone(
  status: Vendor["status"],
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "archived":
      return "default";
    default:
      return "default";
  }
}

function lifecycleLabel(vendor: Vendor) {
  return `${statusLabel(vendor.status)} · ${vendorCategoryLabel(vendor.category)}`;
}

export function VendorWorkspaceHeader({
  workspaceId,
  companyId,
  vendor,
  canWriteVendor,
}: VendorWorkspaceHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const actions = useMemo((): WorkspaceHeaderAction[] => {
    if (!canWriteVendor) return [];

    const next: WorkspaceHeaderAction[] = [];

    if (vendor.status !== "archived") {
      next.push({
        key: "edit",
        label: uiZh.edit,
        href: `/dashboard/vendors/${vendor.id}/edit`,
        disabled: pending,
      });
    }

    if (vendor.status === "active") {
      next.push({
        key: "deactivate",
        label: uiZh.deactivate,
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    if (vendor.status !== "archived") {
      next.push({
        key: "archive",
        label: uiZh.archive,
        disabled: pending,
        onClick: () => {
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
        },
      });
    } else {
      next.push({
        key: "restore",
        label: uiZh.restore,
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    return next;
  }, [
    canWriteVendor,
    companyId,
    pending,
    router,
    startTransition,
    vendor.id,
    vendor.status,
    workspaceId,
  ]);

  return (
    <WorkspaceHeader
      eyebrow={uiZh.vendorWorkspace}
      title={vendor.name}
      status={{
        label: statusLabel(vendor.status),
        tone: vendorStatusTone(vendor.status),
      }}
      lifecycle={lifecycleLabel(vendor)}
      breadcrumbs={buildWorkspaceBreadcrumbs("vendor")}
      actions={actions}
    />
  );
}
