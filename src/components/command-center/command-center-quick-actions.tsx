"use client";

import Link from "next/link";

import { WorkspaceSection } from "@/components/shared/workspace-section";
import { uiZh } from "@/config/ui-zh";
import { brandGhostButtonClassName } from "@/lib/brand-ui";
import { cn } from "@/lib/utils";

type QuickAction = {
  label: string;
  href: string;
};

type CommandCenterQuickActionsProps = {
  canWriteClient: boolean;
  canWriteProject: boolean;
  canWriteVendor: boolean;
};

/**
 * MVP quick actions — Client / Project / Vendor only, permission-gated.
 */
export function CommandCenterQuickActions({
  canWriteClient,
  canWriteProject,
  canWriteVendor,
}: CommandCenterQuickActionsProps) {
  const actions: QuickAction[] = [];
  if (canWriteClient) {
    actions.push({ label: uiZh.newClient, href: "/dashboard/clients/new" });
  }
  if (canWriteProject) {
    actions.push({ label: uiZh.newProject, href: "/dashboard/projects/new" });
  }
  if (canWriteVendor) {
    actions.push({ label: uiZh.newVendor, href: "/dashboard/vendors/new" });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <WorkspaceSection title={uiZh.quickActions}>
      <div className="flex flex-wrap gap-1">
        {actions.map((action) => (
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
