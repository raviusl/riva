import { uiZh } from "@/config/ui-zh";

export const VENDOR_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "projects", label: uiZh.projects },
  { id: "meetings", label: uiZh.meetings },
  { id: "documents", label: uiZh.documents },
  { id: "timeline", label: uiZh.timeline },
  { id: "finance", label: uiZh.finance },
  { id: "activity", label: uiZh.activity },
  { id: "notes", label: uiZh.notes },
] as const;

export type VendorWorkspaceTabId =
  (typeof VENDOR_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_VENDOR_WORKSPACE_TAB: VendorWorkspaceTabId = "overview";

export function isVendorWorkspaceTabId(
  value: string | null | undefined,
): value is VendorWorkspaceTabId {
  return VENDOR_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseVendorWorkspaceTab(
  value: string | null | undefined,
): VendorWorkspaceTabId {
  return isVendorWorkspaceTabId(value)
    ? value
    : DEFAULT_VENDOR_WORKSPACE_TAB;
}

export function buildVendorWorkspaceHref(
  vendorId: string,
  tab: VendorWorkspaceTabId = DEFAULT_VENDOR_WORKSPACE_TAB,
): string {
  const base = `/dashboard/vendors/${vendorId}`;
  if (tab === DEFAULT_VENDOR_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildVendorWorkspaceTabHref(
  vendorId: string,
  tab: VendorWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/vendors/${vendorId}`;
  if (tab === DEFAULT_VENDOR_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
