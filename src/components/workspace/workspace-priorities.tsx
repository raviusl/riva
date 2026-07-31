import Link from "next/link";

import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";

export type PriorityItem = {
  id: string;
  title: string;
  meta?: string;
  href: string;
};

type WorkspacePrioritiesProps = {
  items: PriorityItem[];
};

export function WorkspacePriorities({ items }: WorkspacePrioritiesProps) {
  return (
    <WorkspaceSection title={uiZh.todaysPriorities}>
      {items.length === 0 ? (
        <SectionEmptyState
          title={uiZh.nothingDueToday}
          description={uiZh.prioritiesAppear}
          actionLabel={uiZh.newTaskTitle}
          actionHref="/dashboard/tasks/new"
        />
      ) : (
        <ul className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-white/[0.03]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white/90">
                    {item.title}
                  </span>
                  {item.meta ? (
                    <span className="mt-0.5 block truncate text-xs text-white/35">
                      {item.meta}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-white/25">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WorkspaceSection>
  );
}
