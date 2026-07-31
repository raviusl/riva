import { AiInsightCard } from "@/components/command-center/ai-insight-card";
import { CommandCenterGreeting } from "@/components/command-center/command-center-greeting";
import { CommandCenterQuickActions } from "@/components/command-center/command-center-quick-actions";
import {
  TodaysFocus,
  type TodaysFocusGroups,
} from "@/components/command-center/todays-focus";
import {
  WorkspaceActivity,
  type ActivityItem,
} from "@/components/workspace/workspace-activity";
import { brandPageClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type DailyWorkspaceHomeProps = {
  displayName: string;
  focus: TodaysFocusGroups;
  activity: ActivityItem[];
  briefMessage: string;
};

/**
 * Daily Workspace home — answers only “What should I do next?”
 *
 * Sections (Product Bible):
 * 1. Greeting
 * 2. Today's Focus
 * 3. Quick Actions (3)
 * 4. AI Daily Brief
 * 5. Recent Activity
 *
 * Not a CRM dashboard. No KPIs. No summaries. No Workspace/Company/Role chrome.
 */
export function CommandCenterHome({
  displayName,
  focus,
  activity,
  briefMessage,
}: DailyWorkspaceHomeProps) {
  return (
    <div
      className={cn(
        brandPageClassName,
        "flex max-w-xl flex-col gap-20 sm:gap-24",
      )}
    >
      <CommandCenterGreeting displayName={displayName} />
      <TodaysFocus groups={focus} />
      <CommandCenterQuickActions />
      <AiInsightCard message={briefMessage} />
      <WorkspaceActivity items={activity} />
    </div>
  );
}

/** @deprecated Use CommandCenterHome — kept as alias for clarity. */
export const DailyWorkspaceHome = CommandCenterHome;
