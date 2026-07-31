import Link from "next/link";

import { SectionEmptyState } from "@/components/shared/section-empty-state";
import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";

export type FocusItem = {
  id: string;
  title: string;
  meta?: string;
  href: string;
};

export type TodaysFocusGroups = {
  tasks: FocusItem[];
  meetings: FocusItem[];
  deadlines: FocusItem[];
};

type FocusGroupProps = {
  title: string;
  items: FocusItem[];
  emptyTitle: string;
  emptyDescription: string;
};

function FocusGroup({
  title,
  items,
  emptyTitle,
  emptyDescription,
}: FocusGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium tracking-tight text-white/50">
        {title}
      </h3>
      {items.length === 0 ? (
        <SectionEmptyState
          title={emptyTitle}
          description={emptyDescription}
          className="px-4 py-5"
        />
      ) : (
        <ul className="divide-y divide-white/[0.05]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-baseline justify-between gap-4 py-3.5 transition duration-200 ease-[var(--riva-ease)] hover:opacity-90"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium tracking-tight text-white/90">
                    {item.title}
                  </span>
                  {item.meta ? (
                    <span className="mt-0.5 block truncate text-xs text-white/35">
                      {item.meta}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type TodaysFocusProps = {
  groups: TodaysFocusGroups;
};

export function TodaysFocus({ groups }: TodaysFocusProps) {
  return (
    <WorkspaceSection title={uiZh.todaysFocus}>
      <div className="space-y-12">
        <FocusGroup
          title={uiZh.todaysTasks}
          items={groups.tasks}
          emptyTitle={uiZh.nothingDueToday}
          emptyDescription={uiZh.taskListClear}
        />
        <FocusGroup
          title={uiZh.todaysMeetings}
          items={groups.meetings}
          emptyTitle={uiZh.noMeetingsToday}
          emptyDescription={uiZh.calendarOpen}
        />
        <FocusGroup
          title={uiZh.todaysDeadlines}
          items={groups.deadlines}
          emptyTitle={uiZh.noDeadlinesToday}
          emptyDescription={uiZh.nothingOverdueOrDue}
        />
      </div>
    </WorkspaceSection>
  );
}
