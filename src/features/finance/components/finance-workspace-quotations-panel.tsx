"use client";

import Link from "next/link";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { calculateTotal, type QuotationStatus } from "@/core/finance";
import type { FinanceWorkspaceItem } from "@/features/finance/lib/finance-types";
import { QUOTATION_DISPLAY_STATUSES } from "@/features/finance/lib/finance-types";
import {
  formatFinanceDate,
  formatFinanceMoney,
  quotationStatusLabel,
} from "@/features/finance/lib/finance-labels";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceQuotationsPanelProps = {
  records: FinanceWorkspaceItem[];
  canCreate?: boolean;
};

export function FinanceWorkspaceQuotationsPanel({
  records,
  canCreate = false,
}: FinanceWorkspaceQuotationsPanelProps) {
  const quotations = records
    .filter((row) => row.type === "quotation")
    .sort((a, b) =>
      (b.issuedAt ?? b.createdAt).localeCompare(a.issuedAt ?? a.createdAt),
    );

  function statusOf(row: FinanceWorkspaceItem): QuotationStatus {
    return row.status as QuotationStatus;
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-white">{uiZh.quotations}</h2>
          <p className="mt-1 text-xs text-white/45">
            {uiZh.quotationsStatusHint}
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/dashboard/finance/quotations/new"
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-white/30 hover:text-white"
          >
            {uiZh.addQuote}
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/45">
        {QUOTATION_DISPLAY_STATUSES.map((status) => {
          const count = quotations.filter(
            (row) => statusOf(row) === status,
          ).length;
          return (
            <span
              key={status}
              className="rounded-full border border-white/10 px-2.5 py-1"
            >
              {quotationStatusLabel(status)} · {count}
            </span>
          );
        })}
      </div>

      {quotations.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noQuotationsYet}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {quotations.map((quotation) => (
            <li key={quotation.id}>
              <Link
                href={`/dashboard/finance/quotations/${quotation.id}`}
                className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:border-white/15"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white">
                    {quotation.referenceNumber ?? uiZh.quotationFallback}
                  </p>
                  <span className="text-xs text-white/55">
                    {quotationStatusLabel(statusOf(quotation))}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                  <span>
                    {formatFinanceMoney(
                      calculateTotal(quotation),
                      quotation.currency,
                    )}
                  </span>
                  <span>
                    {uiZh.issuedAtLabel(formatFinanceDate(quotation.issuedAt))}
                  </span>
                  <span>
                    Valid until {formatFinanceDate(quotation.dueAt)}
                  </span>
                  {quotation.clientId && quotation.clientName ? (
                    <WorkspaceEntityLink
                      kind="client"
                      id={quotation.clientId}
                      className="text-white/70 hover:text-white"
                    >
                      {quotation.clientName}
                    </WorkspaceEntityLink>
                  ) : null}
                  {quotation.projectId && quotation.projectName ? (
                    <WorkspaceEntityLink
                      kind="project"
                      id={quotation.projectId}
                      className="text-white/70 hover:text-white"
                    >
                      {quotation.projectName}
                    </WorkspaceEntityLink>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
