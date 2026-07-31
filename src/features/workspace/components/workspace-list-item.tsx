"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { uiZh } from "@/config/ui-zh";
import { switchWorkspaceAction } from "@/core/actions/workspace-actions";
import type { Workspace } from "@/core/types";

type WorkspaceListItemProps = {
  workspace: Workspace;
  active: boolean;
};

const WORKSPACE_STATUS_LABELS: Record<Workspace["status"], string> = {
  pending: uiZh.pending,
  active: uiZh.active,
  suspended: uiZh.suspended,
  archived: uiZh.archived,
};

export function WorkspaceListItem({
  workspace,
  active,
}: WorkspaceListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          if (!active) {
            const result = await switchWorkspaceAction({
              workspaceId: workspace.id,
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
          }
          router.push("/dashboard/settings/workspace");
          router.refresh();
        });
      }}
      className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-left transition-colors hover:bg-white/[0.05] disabled:opacity-60"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {workspace.name}
            {active ? (
              <span className="ml-2 text-[11px] font-normal text-white/40">
                {uiZh.active}
              </span>
            ) : null}
          </p>
          <p className="mt-1 truncate text-xs text-white/40">
            {workspace.slug}
            {workspace.country ? ` · ${workspace.country}` : ""}
            {` · ${workspace.timezone}`}
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 text-[11px] tracking-wide text-white/55">
          {WORKSPACE_STATUS_LABELS[workspace.status]}
        </span>
      </div>
    </button>
  );
}
