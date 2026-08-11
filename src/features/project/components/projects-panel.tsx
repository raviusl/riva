import Link from "next/link";

import type { Project } from "@/core/types";
import { formatProjectStatus } from "@/components/projects/project-labels";
import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

type ProjectsPanelProps = {
  projects: Project[];
  companyName: string;
  canWrite: boolean;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectsPanel({
  projects,
  companyName,
  canWrite,
}: ProjectsPanelProps) {
  const activeProjects = projects.filter(
    (project) => project.status !== "archived",
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-white">
            {uiZh.projects} ({activeProjects.length})
          </h2>
          <p className="mt-1 text-xs text-white/45">{companyName}</p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/projects/new"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.createProject}
          </Link>
        ) : null}
      </div>

      {activeProjects.length === 0 ? (
        <div className="mt-4">
          <ModuleEmptyState
            title={uiZh.noProjectsYetTitle}
            description={uiZh.createProjectOrganize}
            actionHref={canWrite ? "/dashboard/projects/new" : undefined}
            actionLabel={canWrite ? uiZh.createProject : undefined}
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {activeProjects.slice(0, 6).map((project) => {
            const workspaceHref = buildWorkspaceOverviewHref(
              "project",
              project.id,
            );
            return (
              <li key={project.id}>
                <Link
                  href={workspaceHref}
                  className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:border-white/12 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">
                        {project.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-white/40">
                        {formatProjectStatus(project.status)}
                        {project.project_type
                          ? ` · ${project.project_type}`
                          : ""}
                        {" · "}
                        {formatDate(project.updated_at)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-white/45">
                      {uiZh.open}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {activeProjects.length > 0 ? (
        <div className="mt-3">
          <Link
            href="/dashboard/projects"
            className="text-xs text-white/45 hover:text-white/70"
          >
            {uiZh.projects} →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
