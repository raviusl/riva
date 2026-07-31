"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { FileUploadDialog } from "@/components/files/file-upload-dialog";
import {
  formatFileDate,
  formatFileSize,
  formatFileType,
} from "@/components/files/file-labels";
import {
  listProjectFiles,
  subscribeProjectFiles,
} from "@/components/files/file-store";
import type { ProjectFile } from "@/components/files/file-types";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uiZh } from "@/config/ui-zh";
import type { Project } from "@/core/types";
import { cn } from "@/lib/utils";

type SortKey =
  | "name"
  | "project"
  | "type"
  | "uploadedBy"
  | "uploadedAt"
  | "size";

type SortDir = "asc" | "desc";

type FileListProps = {
  workspaceId: string;
  companyId: string;
  businessName: string;
  projects: Pick<Project, "id" | "name">[];
  uploaderId: string;
  uploaderName: string;
  canWrite: boolean;
};

function compareValues(
  a: string | number,
  b: string | number,
  dir: SortDir,
): number {
  if (a < b) return dir === "asc" ? -1 : 1;
  if (a > b) return dir === "asc" ? 1 : -1;
  return 0;
}

export function FileList({
  workspaceId,
  companyId,
  businessName,
  projects,
  uploaderId,
  uploaderName,
  canWrite,
}: FileListProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("uploadedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setFiles(listProjectFiles(workspaceId, companyId));
    setHydrated(true);
    return subscribeProjectFiles(workspaceId, companyId, () => {
      setFiles(listProjectFiles(workspaceId, companyId));
    });
  }, [workspaceId, companyId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? files.filter((file) => {
          const haystack = [
            file.name,
            file.projectName,
            formatFileType(file.type),
            file.uploadedByName,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : files;

    return [...base].sort((left, right) => {
      switch (sortKey) {
        case "name":
          return compareValues(
            left.name.toLowerCase(),
            right.name.toLowerCase(),
            sortDir,
          );
        case "project":
          return compareValues(
            left.projectName.toLowerCase(),
            right.projectName.toLowerCase(),
            sortDir,
          );
        case "type":
          return compareValues(
            formatFileType(left.type),
            formatFileType(right.type),
            sortDir,
          );
        case "uploadedBy":
          return compareValues(
            left.uploadedByName.toLowerCase(),
            right.uploadedByName.toLowerCase(),
            sortDir,
          );
        case "uploadedAt":
          return compareValues(left.uploadedAt, right.uploadedAt, sortDir);
        case "size":
          return compareValues(left.size, right.size, sortDir);
        default:
          return 0;
      }
    });
  }, [files, query, sortDir, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "uploadedAt" || key === "size" ? "desc" : "asc");
  }

  function SortButton({
    label,
    column,
    className,
  }: {
    label: string;
    column: SortKey;
    className?: string;
  }) {
    const active = sortKey === column;
    return (
      <button
        type="button"
        onClick={() => toggleSort(column)}
        className={cn(
          "inline-flex items-center gap-1 text-left transition duration-[var(--riva-motion)]",
          active ? "text-white/70" : "text-white/35 hover:text-white/55",
          className,
        )}
      >
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          )
        ) : null}
      </button>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
            {uiZh.projects}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.75rem]">
            {uiZh.files}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/40">
            {uiZh.projectDocumentsFor(businessName)}
          </p>
        </div>
        {canWrite ? (
          <FileUploadDialog
            workspaceId={workspaceId}
            companyId={companyId}
            projects={projects}
            uploaderId={uploaderId}
            uploaderName={uploaderName}
          />
        ) : null}
      </div>

      {!hydrated ? (
        <p className="text-sm text-white/35">{uiZh.loadingFiles}</p>
      ) : (
        <>
          {files.length > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={uiZh.searchFiles}
                className="h-10 max-w-md"
                aria-label={uiZh.searchFiles}
              />
              <p className="text-xs text-white/35">
                {uiZh.countOfTotal(filtered.length, files.length)}
              </p>
            </div>
          ) : null}

          {files.length === 0 ? (
            <div className="space-y-4">
              <SectionEmptyState
                title={uiZh.noFilesYet}
                description={uiZh.uploadFileLinkProject}
              />
              {canWrite ? (
                <FileUploadDialog
                  workspaceId={workspaceId}
                  companyId={companyId}
                  projects={projects}
                  uploaderId={uploaderId}
                  uploaderName={uploaderName}
                />
              ) : null}
            </div>
          ) : filtered.length === 0 ? (
            <SectionEmptyState
              title={uiZh.noMatchingFiles}
              description={uiZh.tryDifferentSearch}
            />
          ) : (
            <div className="riva-surface overflow-hidden rounded-[var(--riva-radius-lg)]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.05] hover:bg-transparent">
                    <TableHead>
                      <SortButton label={uiZh.fileName} column="name" />
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <SortButton label={uiZh.projects} column="project" />
                    </TableHead>
                    <TableHead>
                      <SortButton label={uiZh.type} column="type" />
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      <SortButton label={uiZh.uploadedBy} column="uploadedBy" />
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      <SortButton label={uiZh.uploadedDate} column="uploadedAt" />
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-right">
                      <SortButton
                        label={uiZh.size}
                        column="size"
                        className="ml-auto"
                      />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/files/${file.id}`}
                          className="font-medium text-white/90 transition hover:text-white"
                        >
                          {file.name}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Link
                          href={`/dashboard/projects/${file.projectId}`}
                          className="text-white/70 transition hover:text-white"
                        >
                          {file.projectName}
                        </Link>
                      </TableCell>
                      <TableCell>{formatFileType(file.type)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {file.uploadedByName || uiZh.emDash}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatFileDate(file.uploadedAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right tabular-nums">
                        {formatFileSize(file.size)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
