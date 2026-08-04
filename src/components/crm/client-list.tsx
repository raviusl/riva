"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { ClientCreateDialog } from "@/components/crm/client-create-dialog";
import {
  formatClientStatus,
  formatClientUpdatedAt,
} from "@/components/crm/client-notes";
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
import type { Client } from "@/core/types";
import { cn } from "@/lib/utils";

export type ClientListRow = {
  client: Client;
  projectCount: number;
};

type SortKey =
  | "name"
  | "status"
  | "phone"
  | "email"
  | "projectCount"
  | "updatedAt";

type SortDir = "asc" | "desc";

type ClientListProps = {
  workspaceId: string;
  companyId: string;
  businessName: string;
  rows: ClientListRow[];
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

export function ClientList({
  workspaceId,
  companyId,
  businessName,
  rows,
  canWrite,
}: ClientListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = rows.filter(({ client }) => {
      if (statusFilter !== "all" && client.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && client.client_type !== typeFilter) {
        return false;
      }
      if (activeFilter === "active" && !client.is_active) return false;
      if (activeFilter === "inactive" && client.is_active) return false;
      if (activeFilter === "archived" && client.status !== "archived") {
        return false;
      }
      if (!q) return true;
      const haystack = [
        client.name,
        client.display_name ?? "",
        client.client_code ?? "",
        client.bride_name ?? "",
        client.groom_name ?? "",
        client.email ?? "",
        client.phone ?? "",
        formatClientStatus(client.status),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...base].sort((left, right) => {
      const a = left.client;
      const b = right.client;
      switch (sortKey) {
        case "name":
          return compareValues(
            (a.display_name || a.name).toLowerCase(),
            (b.display_name || b.name).toLowerCase(),
            sortDir,
          );
        case "status":
          return compareValues(a.status, b.status, sortDir);
        case "phone":
          return compareValues(
            (a.phone ?? "").toLowerCase(),
            (b.phone ?? "").toLowerCase(),
            sortDir,
          );
        case "email":
          return compareValues(
            (a.email ?? "").toLowerCase(),
            (b.email ?? "").toLowerCase(),
            sortDir,
          );
        case "projectCount":
          return compareValues(left.projectCount, right.projectCount, sortDir);
        case "updatedAt":
        default:
          return compareValues(a.updated_at, b.updated_at, sortDir);
      }
    });
  }, [activeFilter, query, rows, sortDir, sortKey, statusFilter, typeFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
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

  const selectClass =
    "h-10 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white/80";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
            {uiZh.crm}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.75rem]">
            {uiZh.clients}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/40">
            {uiZh.clientDirectoryFor(businessName)}
          </p>
        </div>
        {canWrite ? (
          <ClientCreateDialog
            workspaceId={workspaceId}
            companyId={companyId}
          />
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={uiZh.searchClients}
              className="h-10 max-w-md border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/30 backdrop-blur-sm"
              aria-label={uiZh.searchClients}
            />
            <p className="text-xs text-white/35">
              {uiZh.countOfTotal(filtered.length, rows.length)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className={selectClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={uiZh.status}
            >
              <option value="all">{uiZh.filterAllStatuses}</option>
              <option value="inquiry">{uiZh.clientStatusInquiry}</option>
              <option value="follow_up">{uiZh.clientStatusFollowUp}</option>
              <option value="confirmed">{uiZh.clientStatusConfirmed}</option>
              <option value="completed">{uiZh.clientStatusCompleted}</option>
              <option value="cancelled">{uiZh.clientStatusCancelled}</option>
              <option value="archived">{uiZh.clientStatusArchived}</option>
            </select>
            <select
              className={selectClass}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label={uiZh.type}
            >
              <option value="all">{uiZh.filterAllTypes}</option>
              <option value="wedding">{uiZh.clientTypeWedding}</option>
              <option value="corporate">{uiZh.clientTypeCorporate}</option>
              <option value="private">{uiZh.clientTypePrivate}</option>
              <option value="others">{uiZh.clientTypeOthers}</option>
            </select>
            <select
              className={selectClass}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              aria-label={uiZh.active}
            >
              <option value="all">{uiZh.all}</option>
              <option value="active">{uiZh.filterActive}</option>
              <option value="inactive">{uiZh.filterInactive}</option>
            </select>
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="space-y-4">
          <SectionEmptyState
            title={uiZh.noClientsYet}
            description={uiZh.addFirstClient}
          />
          {canWrite ? (
            <div className="flex justify-start">
              <ClientCreateDialog
                workspaceId={workspaceId}
                companyId={companyId}
              />
            </div>
          ) : null}
        </div>
      ) : filtered.length === 0 ? (
        <SectionEmptyState
          title={uiZh.noMatchingClients}
          description={uiZh.tryDifferentSearch}
        />
      ) : (
        <div className="riva-surface overflow-hidden rounded-[var(--riva-radius-lg)]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="px-4 py-3">
                  <SortButton label={uiZh.clientName} column="name" />
                </TableHead>
                <TableHead className="hidden px-4 py-3 md:table-cell">
                  {uiZh.clientCode}
                </TableHead>
                <TableHead className="px-4 py-3">
                  <SortButton label={uiZh.status} column="status" />
                </TableHead>
                <TableHead className="hidden px-4 py-3 md:table-cell">
                  <SortButton label={uiZh.phone} column="phone" />
                </TableHead>
                <TableHead className="hidden px-4 py-3 lg:table-cell">
                  <SortButton label={uiZh.email} column="email" />
                </TableHead>
                <TableHead className="hidden px-4 py-3 sm:table-cell">
                  <SortButton label={uiZh.projects} column="projectCount" />
                </TableHead>
                <TableHead className="px-4 py-3 text-right">
                  <SortButton
                    label={uiZh.updated}
                    column="updatedAt"
                    className="ml-auto"
                  />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ client, projectCount }) => (
                <TableRow
                  key={client.id}
                  className="border-white/[0.05] transition duration-200 hover:bg-white/[0.025]"
                >
                  <TableCell className="px-4 py-3.5">
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="font-medium text-white/90 transition hover:text-white"
                    >
                      {client.display_name || client.name}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      {client.client_type ?? uiZh.emDash}
                      {!client.is_active ? ` · ${uiZh.filterInactive}` : ""}
                    </p>
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-white/45 md:table-cell">
                    {client.client_code || uiZh.emDash}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-white/55">
                    {formatClientStatus(client.status)}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-white/55 md:table-cell">
                    {client.phone?.trim() || uiZh.emDash}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-white/55 lg:table-cell">
                    {client.email?.trim() || uiZh.emDash}
                  </TableCell>
                  <TableCell className="hidden px-4 py-3.5 text-white/55 sm:table-cell">
                    {projectCount}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right text-white/45">
                    {formatClientUpdatedAt(client.updated_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

