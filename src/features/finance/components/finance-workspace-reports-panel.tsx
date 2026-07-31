import type { FinanceWorkspaceSummary } from "@/features/finance/lib/finance-types";
import { formatFinanceMoney } from "@/features/finance/lib/finance-labels";
import { uiZh } from "@/config/ui-zh";

type FinanceWorkspaceReportsPanelProps = {
  summary: FinanceWorkspaceSummary;
};

const REPORT_CARDS = [
  { key: "revenue", label: uiZh.revenue, field: "revenue" as const },
  { key: "expense", label: uiZh.expense, field: "expense" as const },
  { key: "profit", label: uiZh.profit, field: "profit" as const },
  { key: "tax", label: uiZh.tax, field: "tax" as const },
] as const;

export function FinanceWorkspaceReportsPanel({
  summary,
}: FinanceWorkspaceReportsPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.reportsTitle}</h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.reportsPreviewDesc}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {REPORT_CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
          >
            <p className="text-[11px] text-white/40">{card.label}</p>
            <p className="mt-2 text-lg text-white">
              {formatFinanceMoney(summary[card.field], summary.currency)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
