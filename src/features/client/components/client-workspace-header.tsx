"use client";

import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import {
  WorkspaceHeader,
  type WorkspaceHeaderAction,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
import {
  archiveClientAction,
  markClientFollowUpAction,
  restoreClientAction,
} from "@/core/actions/client-actions";
import type { Client } from "@/core/types";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceHeaderProps = {
  workspaceId: string;
  companyId: string;
  client: Client;
  canWriteClient: boolean;
};

function statusLabel(status: Client["status"]) {
  if (status === "follow_up") return uiZh.followUp;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function typeLabel(type: Client["client_type"]) {
  if (!type) return null;
  if (type === "corporate") return uiZh.corporateClient;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function clientStatusTone(
  status: Client["status"],
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "inquiry":
      return "info";
    case "follow_up":
      return "warning";
    case "confirmed":
      return "success";
    case "completed":
      return "success";
    case "cancelled":
      return "default";
    case "archived":
      return "default";
    default:
      return "default";
  }
}

function lifecycleLabel(client: Client) {
  const parts = [statusLabel(client.status)];
  const type = typeLabel(client.client_type);
  if (type) parts.push(type);
  return parts.join(" · ");
}

export function ClientWorkspaceHeader({
  workspaceId,
  companyId,
  client,
  canWriteClient,
}: ClientWorkspaceHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const actions = useMemo((): WorkspaceHeaderAction[] => {
    if (!canWriteClient) return [];

    const next: WorkspaceHeaderAction[] = [];

    if (client.status !== "archived") {
      next.push({
        key: "edit",
        label: uiZh.edit,
        href: `/dashboard/clients/${client.id}/edit`,
        disabled: pending,
      });
    }

    if (client.status === "inquiry" && client.is_active) {
      next.push({
        key: "follow-up",
        label: uiZh.followUp,
        disabled: pending,
        onClick: () => {
          startTransition(async () => {
            const result = await markClientFollowUpAction({
              workspaceId,
              companyId,
              clientId: client.id,
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.markedForFollowUp);
            router.refresh();
          });
        },
      });
    }

    if (client.status !== "archived") {
      next.push({
        key: "archive",
        label: uiZh.archive,
        disabled: pending,
        onClick: () => {
          startTransition(async () => {
            const result = await archiveClientAction({
              workspaceId,
              companyId,
              clientId: client.id,
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.clientArchivedToast);
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
            const result = await restoreClientAction({
              workspaceId,
              companyId,
              clientId: client.id,
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.clientRestoredToast);
            router.refresh();
          });
        },
      });
    }

    return next;
  }, [
    canWriteClient,
    client.id,
    client.status,
    client.is_active,
    companyId,
    pending,
    router,
    startTransition,
    workspaceId,
  ]);

  return (
    <WorkspaceHeader
      eyebrow={uiZh.clientWorkspace}
      title={client.name}
      status={{
        label: statusLabel(client.status),
        tone: clientStatusTone(client.status),
      }}
      lifecycle={lifecycleLabel(client)}
      breadcrumbs={buildWorkspaceBreadcrumbs("client")}
      actions={actions}
    />
  );
}
