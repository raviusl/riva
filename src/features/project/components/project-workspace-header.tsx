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
  activateProjectAction,
  archiveProjectAction,
  restoreProjectAction,
} from "@/core/actions/project-actions";
import type { Project } from "@/core/types";
import { buildWorkspaceBreadcrumbs } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type ProjectWorkspaceHeaderProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  canWriteProject: boolean;
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function projectStatusTone(
  status: Project["status"],
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "inquiry":
    case "proposal":
    case "confirmed":
    case "planning":
      return "info";
    case "execution":
      return "success";
    case "completed":
      return "success";
    case "cancelled":
    case "archived":
      return "default";
    default:
      return "default";
  }
}

function lifecycleLabel(project: Project) {
  const parts = [statusLabel(project.status)];
  if (project.project_type) {
    parts.push(project.project_type);
  }
  return parts.join(" · ");
}

export function ProjectWorkspaceHeader({
  workspaceId,
  companyId,
  project,
  canWriteProject,
}: ProjectWorkspaceHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const actions = useMemo((): WorkspaceHeaderAction[] => {
    if (!canWriteProject) return [];

    const next: WorkspaceHeaderAction[] = [];

    if (project.status !== "archived") {
      next.push({
        key: "edit",
        label: uiZh.edit,
        href: `/dashboard/projects/${project.id}/edit`,
        disabled: pending,
      });
    }

    if (project.status === "planning" || project.status === "confirmed") {
      next.push({
        key: "activate",
        label: uiZh.activate,
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    if (project.status === "execution") {
      next.push({
        key: "archive",
        label: uiZh.archive,
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    if (project.status === "archived") {
      next.push({
        key: "restore",
        label: uiZh.restore,
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    return next;
  }, [
    canWriteProject,
    companyId,
    pending,
    project.id,
    project.status,
    router,
    startTransition,
    workspaceId,
  ]);

  return (
    <WorkspaceHeader
      eyebrow={uiZh.projectWorkspaceTitle}
      title={project.name}
      status={{
        label: statusLabel(project.status),
        tone: projectStatusTone(project.status),
      }}
      lifecycle={lifecycleLabel(project)}
      breadcrumbs={buildWorkspaceBreadcrumbs("project")}
      actions={actions}
    />
  );
}
