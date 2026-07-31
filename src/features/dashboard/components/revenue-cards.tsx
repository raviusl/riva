import { AppEmptyState } from "@/components/layout/app-empty-state";
import { uiZh } from "@/config/ui-zh";

type RevenueCardsProps = {
  monthlyRevenue: number;
  monthlyProfit: number;
  outstandingPayments: number;
  currency: string;
  hasRecords: boolean;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
      <p className="text-sm text-white/70">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function RevenueCards({
  monthlyRevenue,
  monthlyProfit,
  outstandingPayments,
  currency,
  hasRecords,
}: RevenueCardsProps) {
  if (!hasRecords) {
    return (
      <section className="space-y-3">
        <h2 className="text-sm text-white/80">{uiZh.monthlyRevenue}</h2>
        <AppEmptyState />
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <MetricCard
        label={uiZh.monthlyRevenue}
        value={formatMoney(monthlyRevenue, currency)}
      />
      <MetricCard
        label={uiZh.monthlyProfit}
        value={formatMoney(monthlyProfit, currency)}
      />
      <MetricCard
        label={uiZh.outstandingPaymentsDash}
        value={formatMoney(outstandingPayments, currency)}
      />
    </section>
  );
}
