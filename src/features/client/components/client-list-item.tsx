"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  archiveClientAction,
  markClientFollowUpAction,
  restoreClientAction,
} from "@/core/actions/client-actions";
import type { Client } from "@/core/types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type ClientListItemProps = {
  workspaceId: string;
  companyId: string;
  client: Client;
  canWrite: boolean;
  projectName?: string | null;
  ownerName?: string | null;
};

function typeLabel(type: Client["client_type"]) {
  if (!type) return uiZh.unspecified;
  if (type === "corporate") return uiZh.corporateClient;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function statusLabel(status: Client["status"]) {
  if (status === "follow_up") return uiZh.followUp;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ClientListItem({
  workspaceId,
  companyId,
  client,
  canWrite,
  projectName,
  ownerName = null,
}: ClientListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const workspaceHref = buildWorkspaceOverviewHref("client", client.id);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={workspaceHref}
            className="truncate text-sm font-medium text-white hover:text-white/80"
          >
            {client.name}
          </Link>
          <p className="mt-1 truncate text-xs text-white/45">
            {typeLabel(client.client_type)} · {statusLabel(client.status)}
            {ownerName ? ` · ${ownerName}` : ""}
            {client.email ? ` · ${client.email}` : ""}
            {client.phone ? ` · ${client.phone}` : ""}
          </p>
          {client.project_id && projectName ? (
            <Link
              href={buildWorkspaceOverviewHref("project", client.project_id)}
              className="mt-1 inline-block truncate text-xs text-white/40 hover:text-white/70"
            >
              Project · {projectName}
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
            Open
          </Button>
          {canWrite ? (
            <>
              {client.status !== "archived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    router.push(`/dashboard/clients/${client.id}/edit`)
                  }
                >
                  Edit
                </Button>
              ) : null}
              {client.status === "inquiry" && client.is_active ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
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
                  }}
                >
                  {uiZh.followUp}
                </Button>
              ) : null}
              {client.status !== "archived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
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
                  }}
                >
                  Archive
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
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
                  }}
                >
                  Restore
                </Button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
