"use client";

import type { FinanceActivity } from "@/core/finance";
import { formatFinanceDate } from "@/features/finance/lib/finance-labels";
import { uiZh } from "@/config/ui-zh";

type QuotationActivityFeedProps = {
  activities: FinanceActivity[];
};

export function QuotationActivityFeed({
  activities,
}: QuotationActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-white/45">暂无动态。</p>
    );
  }

  return (
    <ul className="space-y-3">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <p className="text-sm text-white/85">{activity.message}</p>
          <p className="mt-1 text-xs text-white/40">
            {formatFinanceDate(activity.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
