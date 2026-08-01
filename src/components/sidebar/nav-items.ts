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
 * First-level Workspace sidebar navigation (Project 061 / 073 / 089).
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
      "/dashboard/tasks",
      "/dashboard/meetings",
      "/dashboard/timeline",
      "/dashboard/calendar",
      "/dashboard/activity",
      "/dashboard/documents",
      "/dashboard/files",
      "/dashboard/automations",
    ],
  },
  {
    id: "finance",
    label: uiZh.navFinance,
    href: "/dashboard/finance",
    matchPrefixes: ["/dashboard/finance"],
    children: [
      {
        id: "finance-quotations",
        label: uiZh.quotations,
        href: "/dashboard/finance/quotations",
        matchPrefixes: ["/dashboard/finance/quotations"],
      },
    ],
  },
  {
    id: "reports",
    label: uiZh.navReports,
    href: "/dashboard/reports",
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
