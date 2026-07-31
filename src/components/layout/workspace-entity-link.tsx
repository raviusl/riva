import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import {
  buildWorkspaceOverviewHref,
  buildWorkspaceTabHref,
  type WorkspaceKind,
} from "@/lib/workspace/cross-navigation";
import { cn } from "@/lib/utils";

type WorkspaceEntityLinkProps = {
  kind: WorkspaceKind;
  id: string;
  /** Defaults to overview for cross-workspace deep links. */
  tab?: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "children" | "className">;

/**
 * History-preserving link into a Project / Client / Vendor / Meeting / Task / Document / Finance / Notification / Automation workspace.
 * Prefer this over hand-built `/dashboard/...` paths in workspace UI.
 */
export function WorkspaceEntityLink({
  kind,
  id,
  tab = "overview",
  className,
  children,
  ...props
}: WorkspaceEntityLinkProps) {
  const href =
    tab === "overview"
      ? buildWorkspaceOverviewHref(kind, id)
      : buildWorkspaceTabHref(kind, id, tab);

  return (
    <Link
      href={href}
      className={cn(
        "text-white transition-colors hover:text-white/80",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
