"use client";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { calculateTotal } from "@/core/finance";
import type { FinanceWorkspaceItem } from "@/features/finance/lib/finance-types";
import {
  financeCategoryLabel,
  financeStatusLabel,
  financeTypeLabel,
  formatFinanceDate,
  formatFinanceMoney,
} from "@/features/finance/lib/finance-labels";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceTransactionsPanelProps = {
  records: FinanceWorkspaceItem[];
};

export function FinanceWorkspaceTransactionsPanel({
  records,
}: FinanceWorkspaceTransactionsPanelProps) {
  const rows = [...records].sort((a, b) =>
    (b.issuedAt ?? b.createdAt).localeCompare(a.issuedAt ?? a.createdAt),
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.transactions}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.allFinanceRecords}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noTransactionsYet}</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/40">
                <th className="pb-2 pr-3 font-medium">{uiZh.type}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.category}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.amount}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.currency}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.status}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.relatedProjectTitle}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.client}</th>
                <th className="pb-2 pr-3 font-medium">{uiZh.vendors}</th>
                <th className="pb-2 font-medium">{uiZh.date}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/[0.06] text-white/80"
                >
                  <td className="py-3 pr-3 text-white">
                    {financeTypeLabel(row.type)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {financeCategoryLabel(row.category)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/80">
                    {formatFinanceMoney(calculateTotal(row), row.currency)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {row.currency}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {financeStatusLabel(row.status)}
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {row.projectId && row.projectName ? (
                      <WorkspaceEntityLink
                        kind="project"
                        id={row.projectId}
                        className="text-white/70 hover:text-white"
                      >
                        {row.projectName}
                      </WorkspaceEntityLink>
                    ) : (
                      <span className="text-white/35">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {row.clientId && row.clientName ? (
                      <WorkspaceEntityLink
                        kind="client"
                        id={row.clientId}
                        className="text-white/70 hover:text-white"
                      >
                        {row.clientName}
                      </WorkspaceEntityLink>
                    ) : (
                      <span className="text-white/35">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-xs">
                    {row.vendorId && row.vendorName ? (
                      <WorkspaceEntityLink
                        kind="vendor"
                        id={row.vendorId}
                        className="text-white/70 hover:text-white"
                      >
                        {row.vendorName}
                      </WorkspaceEntityLink>
                    ) : (
                      <span className="text-white/35">—</span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-white/55">
                    {formatFinanceDate(row.issuedAt ?? row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
