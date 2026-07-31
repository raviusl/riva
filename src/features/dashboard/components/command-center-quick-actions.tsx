import Link from "next/link";

import { DashboardSection } from "@/features/dashboard/components/dashboard-section";
import { uiZh } from "@/config/ui-zh";

export type QuickActionLink = {
  label: string;
  href: string;
  description?: string;
};

type CommandCenterQuickActionsProps = {
  actions: QuickActionLink[];
};

/**
 * Navigation shortcuts only — no creation workflows or modals.
 */
export function CommandCenterQuickActions({
  actions,
}: CommandCenterQuickActionsProps) {
  return (
    <DashboardSection
      title={uiZh.quickActions}
      description={uiZh.quickActionsJump}
    >
      {actions.length === 0 ? (
        <p className="text-sm text-white/45">{uiZh.noShortcutsAvailable}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.05]"
            >
              <p className="text-sm text-white">{action.label}</p>
              {action.description ? (
                <p className="mt-1 text-xs text-white/40">{action.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </DashboardSection>
  );
}
