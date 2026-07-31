"use client";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { calculateTotal, type FinanceStatus } from "@/core/finance";
import type { FinanceWorkspaceItem } from "@/features/finance/lib/finance-types";
import {
  formatFinanceDate,
  formatFinanceMoney,
  invoiceStatusLabel,
} from "@/features/finance/lib/finance-labels";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceInvoicesPanelProps = {
  records: FinanceWorkspaceItem[];
};

const INVOICE_STATUSES: FinanceStatus[] = [
  "draft",
  "open",
  "paid",
  "overdue",
  "cancelled",
];

export function FinanceWorkspaceInvoicesPanel({
  records,
}: FinanceWorkspaceInvoicesPanelProps) {
  const invoices = records
    .filter((row) => row.type === "invoice")
    .sort((a, b) =>
      (b.issuedAt ?? b.createdAt).localeCompare(a.issuedAt ?? a.createdAt),
    );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.invoices}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.invoicesStatusHint}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/45">
        {INVOICE_STATUSES.map((status) => {
          const count = invoices.filter((row) => row.status === status).length;
          return (
            <span
              key={status}
              className="rounded-full border border-white/10 px-2.5 py-1"
            >
              {invoiceStatusLabel(status)} · {count}
            </span>
          );
        })}
      </div>

      {invoices.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noInvoicesYet}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {invoices.map((invoice) => (
            <li
              key={invoice.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">
                  {invoice.referenceNumber ?? uiZh.invoiceFallback}
                </p>
                <span className="text-xs text-white/55">
                  {invoiceStatusLabel(invoice.status)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                <span>
                  {formatFinanceMoney(
                    calculateTotal(invoice),
                    invoice.currency,
                  )}
                </span>
                <span>
                  {uiZh.issuedAtLabel(formatFinanceDate(invoice.issuedAt))}
                </span>
                <span>Due {formatFinanceDate(invoice.dueAt)}</span>
                {invoice.clientId && invoice.clientName ? (
                  <WorkspaceEntityLink
                    kind="client"
                    id={invoice.clientId}
                    className="text-white/70 hover:text-white"
                  >
                    {invoice.clientName}
                  </WorkspaceEntityLink>
                ) : null}
                {invoice.projectId && invoice.projectName ? (
                  <WorkspaceEntityLink
                    kind="project"
                    id={invoice.projectId}
                    className="text-white/70 hover:text-white"
                  >
                    {invoice.projectName}
                  </WorkspaceEntityLink>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
