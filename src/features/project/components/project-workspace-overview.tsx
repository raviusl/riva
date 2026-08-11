"use client";

import Link from "next/link";

import type { Client, Project } from "@/core/types";
import { formatProjectStatus } from "@/components/projects/project-labels";
import { uiZh } from "@/config/ui-zh";
import { cn } from "@/lib/utils";

type ProjectWorkspaceOverviewProps = {
  project: Project;
  clients: Client[];
  canWriteProject: boolean;
  coordinatorLabel?: string | null;
  salesLabel?: string | null;
  plannerLabel?: string | null;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function countdownLabel(weddingDate: string | null): string {
  if (!weddingDate) return uiZh.emDash;
  const target = new Date(`${weddingDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return uiZh.emDash;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return uiZh.weddingPassed;
  return uiZh.daysUntilWedding(diff);
}

function coupleName(clients: Client[], project: Project): string {
  const primary =
    clients.find((c) => c.id === project.client_id) ?? clients[0] ?? null;
  if (!primary) return uiZh.emDash;
  return (
    primary.display_name ||
    [primary.bride_name, primary.groom_name].filter(Boolean).join(" & ") ||
    primary.name
  );
}

function OverviewCard({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 break-words text-sm text-white/80",
          emphasize && "text-base font-medium text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PlaceholderPanel({
  title,
  empty,
}: {
  title: string;
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
        {title}
      </p>
      <p className="mt-3 text-sm text-white/40">{empty}</p>
    </div>
  );
}

/** Project 097 — Wedding Project Overview (foundation widgets). */
export function ProjectWorkspaceOverview({
  project,
  clients,
  canWriteProject,
  coordinatorLabel,
  salesLabel,
  plannerLabel,
}: ProjectWorkspaceOverviewProps) {
  const weddingDate = project.wedding_date || project.event_date;
  const primaryClient =
    clients.find((c) => c.id === project.client_id) ?? clients[0] ?? null;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          label={uiZh.couple}
          value={coupleName(clients, project)}
          emphasize
        />
        <OverviewCard label={uiZh.weddingDate} value={formatDate(weddingDate)} />
        <OverviewCard
          label={uiZh.countdown}
          value={countdownLabel(weddingDate)}
          emphasize
        />
        <OverviewCard
          label={uiZh.status}
          value={formatProjectStatus(project.status)}
        />
        <OverviewCard
          label={uiZh.venue}
          value={project.venue || primaryClient?.venue || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.ballroom}
          value={project.ballroom || primaryClient?.ballroom || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.expectedPax}
          value={
            project.expected_pax != null
              ? String(project.expected_pax)
              : primaryClient?.expected_pax != null
                ? String(primaryClient.expected_pax)
                : uiZh.emDash
          }
        />
        <OverviewCard
          label={uiZh.clientBudget}
          value={
            project.client_budget != null
              ? project.client_budget.toLocaleString("zh-CN")
              : uiZh.emDash
          }
        />
        <OverviewCard
          label={uiZh.planner}
          value={plannerLabel || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.coordinator}
          value={coordinatorLabel || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.salesPersonLabel}
          value={salesLabel || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.packageName}
          value={project.package_name || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.projectCode}
          value={project.project_code || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.weddingSession}
          value={project.session || primaryClient?.session || uiZh.emDash}
        />
        <OverviewCard
          label={uiZh.eventDate}
          value={formatDate(project.event_date)}
        />
        <OverviewCard
          label={uiZh.notes}
          value={project.notes?.trim() || uiZh.emDash}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlaceholderPanel
          title={uiZh.latestActivity}
          empty={uiZh.noActivityYet}
        />
        <PlaceholderPanel title={uiZh.recentFiles} empty={uiZh.noFilesYet} />
        <PlaceholderPanel
          title={uiZh.upcomingTasks}
          empty={uiZh.noUpcomingTasks}
        />
      </div>

      {canWriteProject || primaryClient ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {primaryClient ? (
            <Link
              href={`/dashboard/clients/${primaryClient.id}`}
              className="text-white/55 underline-offset-4 hover:text-white/80 hover:underline"
            >
              {uiZh.client}: {primaryClient.display_name || primaryClient.name}
            </Link>
          ) : null}
          {canWriteProject && project.status !== "archived" ? (
            <Link
              href={`/dashboard/projects/${project.id}/edit`}
              className="text-white/55 underline-offset-4 hover:text-white/80 hover:underline"
            >
              {uiZh.editProject}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
