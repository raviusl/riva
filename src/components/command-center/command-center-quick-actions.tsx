import Link from "next/link";

import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";
import { brandGhostButtonClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { label: uiZh.newClient, href: "/dashboard/clients/new" },
  { label: uiZh.newProject, href: "/dashboard/projects/new" },
  { label: uiZh.newTask, href: "/dashboard/tasks/new" },
] as const;

export function CommandCenterQuickActions() {
  return (
    <WorkspaceSection title={uiZh.quickActions}>
      <div className="flex flex-wrap gap-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(brandGhostButtonClassName, "px-3 text-white/70")}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </WorkspaceSection>
  );
}
