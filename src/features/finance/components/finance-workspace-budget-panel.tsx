import type {
  FinanceBudgetLine,
  FinanceWorkspaceSummary,
} from "@/features/finance/lib/finance-types";
import {
  budgetProgressPercent,
  financeCategoryLabel,
  formatFinanceMoney,
} from "@/features/finance/lib/finance-labels";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceBudgetPanelProps = {
  lines: FinanceBudgetLine[];
  summary: FinanceWorkspaceSummary;
};

export function FinanceWorkspaceBudgetPanel({
  lines,
  summary,
}: FinanceWorkspaceBudgetPanelProps) {
  const currency = summary.currency;
  const overallProgress = budgetProgressPercent(
    summary.budgetTotal,
    summary.budgetActual,
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.budget}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.budgetProgressHint}
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-white/40">{uiZh.budget}</p>
          <p className="mt-1 text-sm text-white">
            {formatFinanceMoney(summary.budgetTotal, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-white/40">{uiZh.actual}</p>
          <p className="mt-1 text-sm text-white">
            {formatFinanceMoney(summary.budgetActual, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-white/40">{uiZh.remaining}</p>
          <p className="mt-1 text-sm text-white">
            {formatFinanceMoney(summary.budgetRemaining, currency)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-white/45">
          <span>{uiZh.overallProgress}</span>
          <span>{overallProgress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white/50"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {lines.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noBudgetLinesYet}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {lines.map((line) => {
            const remaining = line.budget - line.actual;
            const progress = budgetProgressPercent(line.budget, line.actual);
            return (
              <li
                key={line.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white">
                    {financeCategoryLabel(line.category)}
                  </p>
                  <span className="text-xs text-white/45">{progress}%</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
                  <span>
                    {uiZh.budgetAmountLabel(formatFinanceMoney(line.budget, line.currency))}
                  </span>
                  <span>
                    {uiZh.actualAmountLabel(formatFinanceMoney(line.actual, line.currency))}
                  </span>
                  <span>
                    {uiZh.remainingAmountLabel(formatFinanceMoney(remaining, line.currency))}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white/40"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
