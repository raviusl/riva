"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { ProjectCreateDialog } from "@/components/projects/project-create-dialog";
import {
  formatProjectDate,
  formatProjectStatus,
} from "@/components/projects/project-labels";
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
import type { Client, Project } from "@/core/types";
import { buildProjectWorkspaceHref } from "@/features/project/lib/project-workspace-tabs";
import { cn } from "@/lib/utils";

export type ProjectListRow = {
  project: Project;
  clientName: string | null;
  ownerName: string | null;
};

type SortKey =
  | "name"
  | "client"
  | "status"
  | "startDate"
  | "endDate"
  | "owner"
  | "clientBudget"
  | "expectedPax";

type SortDir = "asc" | "desc";

type ProjectListProps = {
  workspaceId: string;
  companyId: string;
  businessName: string;
  rows: ProjectListRow[];
  clients: Client[];
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

export function ProjectList({
  workspaceId,
  companyId,
  businessName,
  rows,
  clients,
  canWrite,
}: ProjectListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter(({ project, clientName, ownerName }) => {
          const haystack = [
            project.name,
            clientName ?? "",
            formatProjectStatus(project.status),
            ownerName ?? "",
            project.client_budget != null ? String(project.client_budget) : "",
            uiZh.clientBudget,
            project.expected_pax != null ? String(project.expected_pax) : "",
            uiZh.expectedPax,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : rows;

    return [...base].sort((left, right) => {
      switch (sortKey) {
        case "name":
          return compareValues(
            left.project.name.toLowerCase(),
            right.project.name.toLowerCase(),
            sortDir,
          );
        case "client":
          return compareValues(
            (left.clientName ?? "").toLowerCase(),
            (right.clientName ?? "").toLowerCase(),
            sortDir,
          );
        case "status":
          return compareValues(
            left.project.status,
            right.project.status,
            sortDir,
          );
        case "startDate":
          return compareValues(
            left.project.start_date ?? "",
            right.project.start_date ?? "",
            sortDir,
          );
        case "endDate":
          return compareValues(
            left.project.end_date ?? "",
            right.project.end_date ?? "",
            sortDir,
          );
        case "owner":
          return compareValues(
            (left.ownerName ?? "").toLowerCase(),
            (right.ownerName ?? "").toLowerCase(),
            sortDir,
          );
        case "clientBudget":
          return compareValues(
            left.project.client_budget ?? -1,
            right.project.client_budget ?? -1,
            sortDir,
          );
        case "expectedPax":
          return compareValues(
            left.project.expected_pax ?? -1,
            right.project.expected_pax ?? -1,
            sortDir,
          );
        default:
          return 0;
      }
    });
  }, [query, rows, sortDir, sortKey]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
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
            {uiZh.projects}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/40">
            {uiZh.operationalWorkFor(businessName)}
          </p>
        </div>
        {canWrite ? (
          <ProjectCreateDialog
            workspaceId={workspaceId}
            companyId={companyId}
            clients={clients}
          />
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={uiZh.searchProjects}
            className="h-10 max-w-md"
            aria-label={uiZh.searchProjects}
          />
          <p className="text-xs text-white/35">
            {uiZh.countOfTotal(filtered.length, rows.length)}
          </p>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="space-y-4">
          <SectionEmptyState
            title={uiZh.noProjectsYet}
            description={uiZh.createProjectToOrganize}
          />
          {canWrite ? (
            <ProjectCreateDialog
              workspaceId={workspaceId}
              companyId={companyId}
              clients={clients}
            />
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <SectionEmptyState
          title={uiZh.noMatchingProjects}
          description={uiZh.tryDifferentSearch}
        />
      ) : (
        <div className="riva-surface overflow-hidden rounded-[var(--riva-radius-lg)]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] hover:bg-transparent">
                <TableHead>
                  <SortButton label={uiZh.projectName} column="name" />
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortButton label={uiZh.client} column="client" />
                </TableHead>
                <TableHead>
                  <SortButton label={uiZh.status} column="status" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortButton label={uiZh.startDate} column="startDate" />
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <SortButton label={uiZh.dueDate} column="endDate" />
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <SortButton label={uiZh.expectedPax} column="expectedPax" />
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  <SortButton label={uiZh.clientBudget} column="clientBudget" />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortButton label={uiZh.owner} column="owner" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ project, clientName, ownerName }) => {
                const workspaceHref = buildProjectWorkspaceHref(project.id);
                return (
                  <TableRow
                    key={project.id}
                    role="link"
                    tabIndex={0}
                    aria-label={project.name}
                    className="cursor-pointer"
                    onClick={() => router.push(workspaceHref)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(workspaceHref);
                      }
                    }}
                  >
                    <TableCell>
                      <Link
                        href={workspaceHref}
                        className="font-medium text-white/90 transition hover:text-white"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {clientName ?? uiZh.emDash}
                    </TableCell>
                    <TableCell>
                      {formatProjectStatus(project.status)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatProjectDate(project.start_date)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {formatProjectDate(project.end_date)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {project.expected_pax != null
                        ? String(project.expected_pax)
                        : uiZh.emDash}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {project.client_budget != null
                        ? project.client_budget.toLocaleString("zh-CN")
                        : uiZh.emDash}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {ownerName ?? uiZh.emDash}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
