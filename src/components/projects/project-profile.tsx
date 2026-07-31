import Link from "next/link";

import {
  formatProjectDate,
  formatProjectStatus,
} from "@/components/projects/project-labels";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";
import type { Project } from "@/core/types";
import { ProjectTimelineEnginePanel } from "@/features/timeline-engine";
import {
  brandPageClassName,
  brandSecondaryButtonClassName,
  brandTitleClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type ProjectProfileProps = {
  project: Project;
  clientName: string | null;
  ownerName: string | null;
  canWrite: boolean;
  canReadTimeline?: boolean;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-baseline">
      <dt className="text-xs tracking-tight text-white/35">{label}</dt>
      <dd className="text-sm text-white/85 break-words">{value}</dd>
    </div>
  );
}

function PlaceholderSection({
  title,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <WorkspaceSection title={title}>
      <SectionEmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="px-4 py-6"
      />
    </WorkspaceSection>
  );
}

export function ProjectProfile({
  project,
  clientName,
  ownerName,
  canWrite,
  canReadTimeline = false,
}: ProjectProfileProps) {
  return (
    <div className={cn(brandPageClassName, "max-w-3xl space-y-12")}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/projects"
            className="text-xs text-white/35 transition duration-200 hover:text-white/60"
          >
            {uiZh.backToList(uiZh.projects)}
          </Link>
          <h1 className={cn("mt-3", brandTitleClassName)}>{project.name}</h1>
          <p className="mt-2 text-sm text-white/40">
            {formatProjectStatus(project.status)}
            {clientName ? (
              <>
                <span className="mx-2 text-white/20">·</span>
                {clientName}
              </>
            ) : null}
          </p>
        </div>
        {canWrite && project.status !== "archived" ? (
          <Link
            href={`/dashboard/projects/${project.id}/edit`}
            className={brandSecondaryButtonClassName}
          >
            {uiZh.edit}
          </Link>
        ) : null}
      </div>

      <WorkspaceSection title={uiZh.overview}>
        <div className="riva-surface rounded-[var(--riva-radius-lg)] px-6 py-6">
          <dl className="space-y-4">
            <InfoRow label={uiZh.projectName} value={project.name} />
            <InfoRow label={uiZh.client} value={clientName ?? uiZh.emDash} />
            <InfoRow
              label={uiZh.status}
              value={formatProjectStatus(project.status)}
            />
            <InfoRow
              label={uiZh.startDate}
              value={formatProjectDate(project.start_date)}
            />
            <InfoRow
              label={uiZh.dueDate}
              value={formatProjectDate(project.end_date)}
            />
            <InfoRow label={uiZh.owner} value={ownerName ?? uiZh.emDash} />
            <InfoRow
              label={uiZh.description}
              value={project.description?.trim() || uiZh.emDash}
            />
          </dl>
        </div>
      </WorkspaceSection>

      <PlaceholderSection
        title={uiZh.activity}
        emptyTitle={uiZh.noActivityYet}
        emptyDescription={uiZh.projectActivitySoon}
      />

      <PlaceholderSection
        title={uiZh.tasks}
        emptyTitle={uiZh.noTasksYet}
        emptyDescription={uiZh.projectTasksSoon}
      />

      {canReadTimeline ? (
        <WorkspaceSection title={uiZh.projectTimelineTitle}>
          <p className="mb-4 text-sm text-white/40">{uiZh.projectTimelineDesc}</p>
          <ProjectTimelineEnginePanel
            workspaceId={project.workspace_id}
            companyId={project.company_id}
            projectId={project.id}
          />
        </WorkspaceSection>
      ) : (
        <PlaceholderSection
          title={uiZh.projectTimelineTitle}
          emptyTitle={uiZh.timeline}
          emptyDescription={uiZh.projectTimelineSoon}
        />
      )}

      <PlaceholderSection
        title={uiZh.files}
        emptyTitle={uiZh.noFilesYet}
        emptyDescription={uiZh.projectFilesSoon}
      />

      <PlaceholderSection
        title={uiZh.team}
        emptyTitle={uiZh.noTeamMembersYet}
        emptyDescription={uiZh.projectTeamSoon}
      />
    </div>
  );
}
