"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uiZh } from "@/config/ui-zh";
import { switchWorkspaceAction } from "@/core/actions/workspace-actions";
import type { Workspace } from "@/core/types";
import { cn } from "@/lib/utils";

type WorkspaceSwitcherProps = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
};

const WORKSPACE_STATUS_LABELS: Record<Workspace["status"], string> = {
  pending: uiZh.pending,
  active: uiZh.active,
  suspended: uiZh.suspended,
  archived: uiZh.archived,
};

function statusLabel(status: Workspace["status"]) {
  return WORKSPACE_STATUS_LABELS[status];
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={uiZh.selectWorkspace}
        className="inline-flex h-9 w-full max-w-[220px] items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none hover:bg-white/[0.06] disabled:opacity-50"
        disabled={pending}
      >
        <span className="truncate">
          {activeWorkspace?.name ?? uiZh.selectWorkspace}
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[240px] border-white/10 bg-[#121214] text-white"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-white/45">
            {uiZh.workspaces}
          </DropdownMenuLabel>
          {workspaces.length === 0 ? (
            <div className="px-2 py-3 text-xs text-white/45">
              {uiZh.noWorkspacesYet}
            </div>
          ) : (
            workspaces.map((workspace) => {
              const active = workspace.id === activeWorkspace?.id;
              return (
                <DropdownMenuItem
                  key={workspace.id}
                  disabled={pending || active}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-0.5",
                    active && "bg-white/[0.08]",
                  )}
                  onClick={() => {
                    if (active) return;
                    startTransition(async () => {
                      const result = await switchWorkspaceAction({
                        workspaceId: workspace.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.switchedTo(workspace.name));
                      router.push("/dashboard/select-company");
                      router.refresh();
                    });
                  }}
                >
                  <span className="truncate text-sm">{workspace.name}</span>
                  <span className="text-[11px] text-white/40">
                    {workspace.slug} · {statusLabel(workspace.status)}
                  </span>
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => router.push("/dashboard/workspaces/new")}
          >
            {uiZh.createWorkspace}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => router.push("/dashboard/workspaces")}
          >
            {uiZh.manageWorkspaces}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => router.push("/dashboard/settings/workspace")}
          >
            {uiZh.workspaceSettings}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
