import Link from "next/link";

import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";

const ACTIONS = [
  { label: uiZh.newClientTitle, href: "/dashboard/clients/new" },
  { label: uiZh.newProjectTitle, href: "/dashboard/projects/new" },
  { label: uiZh.newTaskTitle, href: "/dashboard/tasks/new" },
] as const;

export function WorkspaceQuickActions() {
  return (
    <WorkspaceSection title={uiZh.quickActions}>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm font-medium tracking-tight text-white/80 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </WorkspaceSection>
  );
}
