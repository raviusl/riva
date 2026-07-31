import Link from "next/link";

import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { uiZh } from "@/config/ui-zh";

export type SchedulePreviewItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  timeLabel: string;
};

type TodaysScheduleProps = {
  items: SchedulePreviewItem[];
};

export function TodaysSchedule({ items }: TodaysScheduleProps) {
  return (
    <DashboardSection
      title={uiZh.todaysSchedule}
      description={uiZh.meetingsAndDueWork}
      actionHref="/dashboard/timeline"
      actionLabel={uiZh.timelineArrow}
    >
      {items.length === 0 ? (
        <p className="text-sm text-white/45">{uiZh.nothingScheduledToday}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {item.timeLabel}
                    {item.subtitle ? ` · ${item.subtitle}` : ""}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 text-xs text-white/45 hover:text-white/70"
                >
                  {uiZh.open}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  );
}
