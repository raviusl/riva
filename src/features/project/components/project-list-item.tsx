"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  activateProjectAction,
  archiveProjectAction,
  restoreProjectAction,
} from "@/core/actions/project-actions";
import type { Project } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

type ProjectListItemProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  canWrite: boolean;
};

function statusLabel(status: Project["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ProjectListItem({
  workspaceId,
  companyId,
  project,
  canWrite,
}: ProjectListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const detailHref = `/dashboard/projects/${project.id}`;

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={project.name}
      className="cursor-pointer rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 transition hover:border-white/12 hover:bg-white/[0.04] sm:px-5"
      onClick={() => router.push(detailHref)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(detailHref);
        }
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href={detailHref}
            className="truncate text-sm font-medium text-white hover:text-white/80"
            onClick={(event) => event.stopPropagation()}
          >
            {project.name}
          </Link>
          <p className="mt-1 truncate text-xs text-white/45">
            {statusLabel(project.status)}
            {project.project_type ? ` · ${project.project_type}` : ""}
            {project.expected_pax != null
              ? ` · ${uiZh.expectedPax} ${project.expected_pax}`
              : ""}
            {project.client_budget != null
              ? ` · ${uiZh.clientBudget} ${project.client_budget.toLocaleString("zh-CN")}`
              : ""}
          </p>
        </div>
        <div
          className="flex flex-wrap gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => router.push(detailHref)}
          >
            Open
          </Button>
          {canWrite ? (
            <>
              {project.status !== "archived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    router.push(`/dashboard/projects/${project.id}/edit`)
                  }
                >
                  Edit
                </Button>
              ) : null}
              {(project.status === "planning" ||
                project.status === "confirmed") ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await activateProjectAction({
                        workspaceId,
                        companyId,
                        projectId: project.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.projectActivated);
                      router.refresh();
                    });
                  }}
                >
                  Activate
                </Button>
              ) : null}
              {project.status === "execution" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await archiveProjectAction({
                        workspaceId,
                        companyId,
                        projectId: project.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.projectArchivedToast);
                      router.refresh();
                    });
                  }}
                >
                  Archive
                </Button>
              ) : null}
              {project.status === "archived" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await restoreProjectAction({
                        workspaceId,
                        companyId,
                        projectId: project.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.projectRestoredToast);
                      router.refresh();
                    });
                  }}
                >
                  Restore
                </Button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
