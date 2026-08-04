"use client";

import Link from "next/link";

import { formatProjectStatus } from "@/components/projects/project-labels";
import type { Client, Project } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

type ClientWorkspaceProjectsPanelProps = {
  client: Client;
  projects: Project[];
  canWriteProject: boolean;
};

export function ClientWorkspaceProjectsPanel({
  client,
  projects,
  canWriteProject,
}: ClientWorkspaceProjectsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-white">{uiZh.projects}</h2>
          <p className="mt-1 text-xs text-white/40">
            {uiZh.projectWorkspaceReady}
          </p>
        </div>
        {canWriteProject && client.status !== "archived" ? (
          <Link
            href={`/dashboard/projects/new?clientId=${client.id}`}
            className="inline-flex rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/80 hover:bg-white/[0.05]"
          >
            {uiZh.createWeddingProject}
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] px-5 py-8 text-sm text-white/40">
          {uiZh.noProjectsYet}
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/85">{project.name}</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    {[
                      project.project_code,
                      formatProjectStatus(project.status),
                      project.wedding_date || project.event_date,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-white/35">{uiZh.open}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
