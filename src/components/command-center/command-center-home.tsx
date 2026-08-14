import {
  CommandCenterGreeting,
} from "@/components/command-center/command-center-greeting";
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
  canWriteClient: boolean;
  canWriteProject: boolean;
  canWriteVendor: boolean;
};

/**
 * Daily Workspace home — answers only “What should I do next?”
 *
 * Sections:
 * 1. Greeting
 * 2. Today's Focus (real task/meeting SoT)
 * 3. Quick Actions (MVP CRM creates, permission-gated)
 * 4. Recent Activity (derived live events)
 *
 * No AI brief. No KPIs. No out-of-MVP create links.
 */
export function CommandCenterHome({
  displayName,
  focus,
  activity,
  canWriteClient,
  canWriteProject,
  canWriteVendor,
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
      <CommandCenterQuickActions
        canWriteClient={canWriteClient}
        canWriteProject={canWriteProject}
        canWriteVendor={canWriteVendor}
      />
      <WorkspaceActivity items={activity} />
    </div>
  );
}

/** @deprecated Use CommandCenterHome — kept as alias for clarity. */
export const DailyWorkspaceHome = CommandCenterHome;
