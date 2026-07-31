import Link from "next/link";

import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";

export type ActivityItem = {
  id: string;
  title: string;
  meta?: string;
  href?: string;
};

type WorkspaceActivityProps = {
  items: ActivityItem[];
};

/**
 * Dashboard consumer of Activity Feed Engine — compact newest-first list.
 */
export function WorkspaceActivity({ items }: WorkspaceActivityProps) {
  return (
    <WorkspaceSection
      title={uiZh.recentActivity}
      action={
        <Link
          href="/dashboard/activity"
          className="text-xs text-white/35 transition hover:text-white/60"
        >
          {uiZh.viewActivity}
        </Link>
      }
    >
      {items.length === 0 ? (
        <SectionEmptyState
          title={uiZh.noRecentActivity}
          description={uiZh.activityWillAppear}
          className="px-4 py-5"
        />
      ) : (
        <ol className="relative space-y-0 border-l border-white/[0.06] pl-5">
          {items.map((item) => {
            const content = (
              <>
                <span className="absolute -left-[4px] top-2 size-1.5 rounded-full bg-white/30" />
                <span className="block text-sm tracking-tight text-white/80">
                  {item.title}
                </span>
                {item.meta ? (
                  <span className="mt-0.5 block text-xs text-white/30">
                    {item.meta}
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={item.id} className="relative pb-5 last:pb-0">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="block transition duration-200 hover:text-white"
                  >
                    {content}
                  </Link>
                ) : (
                  <div>{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </WorkspaceSection>
  );
}
