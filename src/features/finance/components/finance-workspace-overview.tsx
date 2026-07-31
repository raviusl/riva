import Link from "next/link";
import type { ReactNode } from "react";

import type { FinanceWorkspaceModel } from "@/features/finance/lib/finance-types";
import {
  formatFinanceDate,
  formatFinanceMoney,
} from "@/features/finance/lib/finance-labels";
import { buildFinanceWorkspaceTabHref } from "@/features/finance/lib/finance-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceOverviewProps = {
  workspace: FinanceWorkspaceModel;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

export function FinanceWorkspaceOverview({
  workspace,
}: FinanceWorkspaceOverviewProps) {
  const { summary, activities } = workspace;
  const currency = summary.currency;
  const recent = activities.slice(0, 5);
  const activityHref = buildFinanceWorkspaceTabHref(workspace.id, "activity");
  const transactionsHref = buildFinanceWorkspaceTabHref(
    workspace.id,
    "transactions",
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.financeSummary}</h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.financeTotalsDesc}
            </p>
          </div>
          <Link
            href={transactionsHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.viewTransactions}
          </Link>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow
            label={uiZh.totalIncome}
            value={formatFinanceMoney(summary.totalIncome, currency)}
          />
          <InfoRow
            label={uiZh.totalExpenses}
            value={formatFinanceMoney(summary.totalExpenses, currency)}
          />
          <InfoRow
            label={uiZh.outstandingInvoices}
            value={formatFinanceMoney(summary.outstandingInvoices, currency)}
          />
          <InfoRow
            label={uiZh.outstandingPaymentsLabel}
            value={formatFinanceMoney(summary.outstandingPayments, currency)}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.budgetSummary}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.budgetPlannedVsActual}
        </p>
        <dl className="mt-5 space-y-4">
          <InfoRow
            label={uiZh.budget}
            value={formatFinanceMoney(summary.budgetTotal, currency)}
          />
          <InfoRow
            label={uiZh.actual}
            value={formatFinanceMoney(summary.budgetActual, currency)}
          />
          <InfoRow
            label={uiZh.remaining}
            value={formatFinanceMoney(summary.budgetRemaining, currency)}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.cashFlowSummary}</h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.cashInVsOut}</p>
        <dl className="mt-5 space-y-4">
          <InfoRow
            label={uiZh.cashIn}
            value={formatFinanceMoney(summary.cashIn, currency)}
          />
          <InfoRow
            label={uiZh.cashOut}
            value={formatFinanceMoney(summary.cashOut, currency)}
          />
          <InfoRow
            label={uiZh.netCashFlow}
            value={formatFinanceMoney(summary.cashFlow, currency)}
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.recentActivityTitle2}</h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.latestFinanceHistory}
            </p>
          </div>
          <Link
            href={activityHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.viewActivity}
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noActivityYet}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white/80">{item.message}</p>
                  <time className="text-[11px] text-white/35">
                    {formatFinanceDate(item.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {item.actorLabel ?? uiZh.unknown}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
