import { uiZh } from "@/config/ui-zh";

export type WorkspaceNavItem = {
  id: string;
  label: string;
  href: string;
  /** Path prefixes that count as active for this item (besides href). */
  matchPrefixes?: readonly string[];
  children?: readonly WorkspaceNavItem[];
};

/**
 * First-level Workspace sidebar navigation (Internal MVP Phase 1).
 * Out-of-MVP surfaces (Finance, Reports, Documents, Files, Automations)
 * stay reachable by URL but are not presented as live nav product.
 * Labels are Simplified Chinese only.
 */
export const WORKSPACE_NAV_ITEMS: readonly WorkspaceNavItem[] = [
  {
    id: "workspace",
    label: uiZh.navHome,
    href: "/dashboard",
  },
  {
    id: "crm",
    label: uiZh.navCrm,
    href: "/dashboard/clients",
    matchPrefixes: ["/dashboard/clients", "/dashboard/vendors"],
  },
  {
    id: "projects",
    label: uiZh.navProjects,
    href: "/dashboard/projects",
    matchPrefixes: [
      "/dashboard/projects",
      "/dashboard/calendar",
      "/dashboard/activity",
    ],
  },
  {
    id: "settings",
    label: uiZh.navSettings,
    href: "/dashboard/settings",
  },
] as const;

export function isWorkspaceNavActive(
  pathname: string,
  item: WorkspaceNavItem,
): boolean {
  if (item.href === "/dashboard") {
    return pathname === "/dashboard";
  }

  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
