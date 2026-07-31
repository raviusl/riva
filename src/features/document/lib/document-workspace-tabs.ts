import { uiZh } from "@/config/ui-zh";

export const DOCUMENT_WORKSPACE_TABS = [
  { id: "overview", label: uiZh.overview },
  { id: "documents", label: uiZh.documents },
  { id: "folders", label: uiZh.folders },
  { id: "versions", label: uiZh.versions },
  { id: "activity", label: uiZh.activity },
] as const;

export type DocumentWorkspaceTabId =
  (typeof DOCUMENT_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_DOCUMENT_WORKSPACE_TAB: DocumentWorkspaceTabId =
  "overview";

export const DOCUMENT_WORKSPACE_HUB_ID = "workspace";

export function isDocumentWorkspaceTabId(
  value: string | null | undefined,
): value is DocumentWorkspaceTabId {
  return DOCUMENT_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseDocumentWorkspaceTab(
  value: string | null | undefined,
): DocumentWorkspaceTabId {
  return isDocumentWorkspaceTabId(value)
    ? value
    : DEFAULT_DOCUMENT_WORKSPACE_TAB;
}

export function buildDocumentWorkspaceHref(
  workspaceId: string,
  tab: DocumentWorkspaceTabId = DEFAULT_DOCUMENT_WORKSPACE_TAB,
): string {
  const base = `/dashboard/documents/${workspaceId}`;
  if (tab === DEFAULT_DOCUMENT_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

export function buildDocumentWorkspaceTabHref(
  workspaceId: string,
  tab: DocumentWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/documents/${workspaceId}`;
  if (tab === DEFAULT_DOCUMENT_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}
