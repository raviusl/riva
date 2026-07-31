"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import {
  formatFileDateTime,
  formatFileSize,
  formatFileType,
} from "@/components/files/file-labels";
import {
  getProjectFile,
  subscribeProjectFiles,
} from "@/components/files/file-store";
import type { ProjectFile } from "@/components/files/file-types";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";
import {
  brandPageClassName,
  brandTitleClassName,
} from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type FileDetailProps = {
  workspaceId: string;
  companyId: string;
  fileId: string;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
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

export function FileDetail({
  workspaceId,
  companyId,
  fileId,
}: FileDetailProps) {
  const [file, setFile] = useState<ProjectFile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFile(getProjectFile(workspaceId, companyId, fileId));
    setHydrated(true);
    return subscribeProjectFiles(workspaceId, companyId, () => {
      setFile(getProjectFile(workspaceId, companyId, fileId));
    });
  }, [workspaceId, companyId, fileId]);

  if (!hydrated) {
    return (
      <div className={cn(brandPageClassName, "max-w-3xl")}>
        <p className="text-sm text-white/35">{uiZh.loadingFile}</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className={cn(brandPageClassName, "max-w-3xl space-y-6")}>
        <Link
          href="/dashboard/files"
          className="text-xs text-white/35 transition duration-200 hover:text-white/60"
        >
          {uiZh.backToList(uiZh.files)}
        </Link>
        <SectionEmptyState
          title={uiZh.fileNotFound}
          description={uiZh.fileMissingOrSession}
          actionLabel={uiZh.backToFiles}
          actionHref="/dashboard/files"
        />
      </div>
    );
  }

  return (
    <div className={cn(brandPageClassName, "max-w-3xl space-y-12")}>
      <div>
        <Link
          href="/dashboard/files"
          className="text-xs text-white/35 transition duration-200 hover:text-white/60"
        >
          {uiZh.backToList(uiZh.files)}
        </Link>
        <h1 className={cn("mt-3", brandTitleClassName)}>{file.name}</h1>
        <p className="mt-2 text-sm text-white/40">
          {formatFileType(file.type)}
          <span className="mx-2 text-white/20">·</span>
          {formatFileSize(file.size)}
        </p>
      </div>

      <WorkspaceSection title={uiZh.overview}>
        <div className="riva-surface rounded-[var(--riva-radius-lg)] px-6 py-6">
          <dl className="space-y-4">
            <InfoRow label={uiZh.fileName} value={file.name} />
            <InfoRow label={uiZh.type} value={formatFileType(file.type)} />
            <InfoRow label={uiZh.size} value={formatFileSize(file.size)} />
            <InfoRow
              label={uiZh.uploadedBy}
              value={file.uploadedByName || uiZh.emDash}
            />
            <InfoRow
              label={uiZh.uploadedDate}
              value={formatFileDateTime(file.uploadedAt)}
            />
            <InfoRow
              label={uiZh.description}
              value={file.description?.trim() || uiZh.emDash}
            />
          </dl>
        </div>
      </WorkspaceSection>

      <PlaceholderSection
        title={uiZh.preview}
        emptyTitle={uiZh.previewUnavailable}
        emptyDescription={uiZh.filePreviewSoon}
      />

      <PlaceholderSection
        title={uiZh.versionHistory}
        emptyTitle={uiZh.noVersionsYet}
        emptyDescription={uiZh.versionHistorySoon}
      />

      <PlaceholderSection
        title={uiZh.activity}
        emptyTitle={uiZh.noActivityYet}
        emptyDescription={uiZh.fileActivitySoon}
      />

      <WorkspaceSection title={uiZh.relatedProjectLabel}>
        <div className="riva-surface rounded-[var(--riva-radius-lg)] px-6 py-5">
          <Link
            href={`/dashboard/projects/${file.projectId}`}
            className="text-sm font-medium text-white/90 transition hover:text-white"
          >
            {file.projectName}
          </Link>
          <p className="mt-1 text-xs text-white/40">
            {uiZh.openRelatedProject}
          </p>
        </div>
      </WorkspaceSection>
    </div>
  );
}
