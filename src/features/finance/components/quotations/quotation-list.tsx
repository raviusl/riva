"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uiZh } from "@/config/ui-zh";
import { calculateTotal, type QuotationStatus } from "@/core/finance";
import type { FinanceWorkspaceItem } from "@/features/finance/lib/finance-types";
import { QUOTATION_DISPLAY_STATUSES } from "@/features/finance/lib/finance-types";
import {
  formatFinanceDate,
  formatFinanceMoney,
  quotationStatusLabel,
} from "@/features/finance/lib/finance-labels";
import { cn } from "@/lib/utils";

export type QuotationListRow = FinanceWorkspaceItem;

type QuotationListProps = {
  rows: QuotationListRow[];
  canWrite: boolean;
  businessName: string;
  pageSize?: number;
};

const PAGE_SIZE_DEFAULT = 10;

export function QuotationList({
  rows,
  canWrite,
  businessName,
  pageSize = PAGE_SIZE_DEFAULT,
}: QuotationListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | QuotationStatus>(
    "all",
  );
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = rows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const number = (row.referenceNumber ?? "").toLowerCase();
      const client = (row.clientName ?? "").toLowerCase();
      return number.includes(q) || client.includes(q);
    });

    return [...next].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }, [query, rows, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function onQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function onStatusChange(value: "all" | QuotationStatus) {
    setStatusFilter(value);
    setPage(1);
  }

  const columns: DataTableColumn<QuotationListRow>[] = [
    {
      id: "number",
      header: uiZh.quotationNumber,
      cell: (row) => (
        <Link
          href={`/dashboard/finance/quotations/${row.id}`}
          className="font-medium text-white/90 transition hover:text-white"
        >
          {row.referenceNumber?.trim() || uiZh.quotationFallback}
        </Link>
      ),
    },
    {
      id: "client",
      header: uiZh.client,
      cell: (row) => (
        <span className="text-white/55">
          {row.clientName?.trim() || uiZh.emDash}
        </span>
      ),
    },
    {
      id: "project",
      header: uiZh.projectSingular,
      className: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-white/55">
          {row.projectName?.trim() || uiZh.emDash}
        </span>
      ),
    },
    {
      id: "status",
      header: uiZh.status,
      cell: (row) => (
        <span className="text-white/55">
          {quotationStatusLabel(row.status as QuotationStatus)}
        </span>
      ),
    },
    {
      id: "total",
      header: uiZh.total,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => (
        <span className="text-white/70">
          {formatFinanceMoney(calculateTotal(row), row.currency)}
        </span>
      ),
    },
    {
      id: "currency",
      header: uiZh.currency,
      className: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      cell: (row) => (
        <span className="text-white/55">{row.currency || uiZh.emDash}</span>
      ),
    },
    {
      id: "validUntil",
      header: uiZh.validUntil,
      className: "hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-white/45">{formatFinanceDate(row.dueAt)}</span>
      ),
    },
    {
      id: "updatedAt",
      header: uiZh.updatedAtCol,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => (
        <span className="text-white/45">
          {formatFinanceDate(row.updatedAt)}
        </span>
      ),
    },
  ];

  const newQuotationButton = canWrite ? (
    <Link
      href="/dashboard/finance/quotations/new"
      className={cn(buttonVariants({ size: "sm" }))}
    >
      {uiZh.addQuote}
    </Link>
  ) : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
            {uiZh.navFinance}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.75rem]">
            {uiZh.quotations}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/40">
            {businessName}
          </p>
        </div>
        {newQuotationButton}
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={uiZh.searchQuotations}
              className="h-10 max-w-md border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/30 backdrop-blur-sm"
              aria-label={uiZh.searchQuotations}
            />
            <select
              value={statusFilter}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as "all" | QuotationStatus,
                )
              }
              className="h-10 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white/80 focus:border-white/20 focus:outline-none"
              aria-label={uiZh.status}
            >
              <option value="all">{uiZh.allStatuses}</option>
              {QUOTATION_DISPLAY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {quotationStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-white/35">
            {uiZh.countOfTotal(filtered.length, rows.length)}
          </p>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="space-y-4">
          <SectionEmptyState
            title={uiZh.noQuotationsYet}
            description={uiZh.addFirstQuotation}
            actionLabel={canWrite ? uiZh.createQuotation : undefined}
            actionHref={
              canWrite ? "/dashboard/finance/quotations/new" : undefined
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <SectionEmptyState
          title={uiZh.noMatchingQuotations}
          description={uiZh.tryDifferentSearch}
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            rows={pageRows}
            getRowKey={(row) => row.id}
          />
          {filtered.length > pageSize ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/35">
                {uiZh.pageOf(currentPage, totalPages)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  {uiZh.previousPage}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  {uiZh.nextPage}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
