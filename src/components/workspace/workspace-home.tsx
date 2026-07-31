import { WorkspaceActivity } from "@/components/workspace/workspace-activity";
import type { ActivityItem } from "@/components/workspace/workspace-activity";
import { WorkspaceGreeting } from "@/components/workspace/workspace-greeting";
import { WorkspacePriorities } from "@/components/workspace/workspace-priorities";
import type { PriorityItem } from "@/components/workspace/workspace-priorities";
import { WorkspaceQuickActions } from "@/components/workspace/workspace-quick-actions";

type WorkspaceHomeProps = {
  displayName: string;
  priorities: PriorityItem[];
  activity: ActivityItem[];
};

/**
 * Legacy home shell — context (Workspace / Company / Role) lives in the switcher,
 * not on the page (Project 070). Prefer CommandCenterHome / Daily Workspace.
 */
export function WorkspaceHome({
  displayName,
  priorities,
  activity,
}: WorkspaceHomeProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
      <WorkspaceGreeting displayName={displayName} />
      <WorkspacePriorities items={priorities} />
      <WorkspaceQuickActions />
      <WorkspaceActivity items={activity} />
    </div>
  );
}
