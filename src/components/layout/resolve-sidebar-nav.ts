import { navItems } from "@/config/i18n";

export type SidebarNavItem = (typeof navItems)[number];
export type SidebarNav = readonly SidebarNavItem[];

/**
 * Resolve sidebar modules for the active Business.
 * Architecture hook for business-specific nav; currently returns the full module set.
 */
export function resolveSidebarNavForBusiness(_input: {
  businessId: string;
  businessType?: string | null;
}): SidebarNav {
  return navItems;
}
