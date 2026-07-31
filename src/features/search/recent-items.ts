/**
 * Recent opened entities for Command Palette (Project 075).
 * Company-scoped · client-side only · max 8.
 */

const STORAGE_PREFIX = "riva.os.command-palette.recent-items.v1";
const MAX_RECENT = 8;

export const RECENT_ITEM_ENTITY_TYPES = [
  "client",
  "project",
  "meeting",
  "vendor",
  "task",
] as const;

export type RecentItemEntityType = (typeof RECENT_ITEM_ENTITY_TYPES)[number];

export type RecentItem = {
  entityType: RecentItemEntityType;
  entityId: string;
  title: string;
  subtitle: string | null;
  href: string;
  openedAt: string;
};

function storageKey(workspaceId: string, companyId: string): string {
  return `${STORAGE_PREFIX}:${workspaceId}:${companyId}`;
}

function isRecentItemEntityType(value: string): value is RecentItemEntityType {
  return (RECENT_ITEM_ENTITY_TYPES as readonly string[]).includes(value);
}

export function listRecentItems(
  workspaceId: string,
  companyId: string,
): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(workspaceId, companyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item === "object" &&
          isRecentItemEntityType(item.entityType) &&
          typeof item.entityId === "string" &&
          typeof item.title === "string" &&
          typeof item.href === "string",
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberRecentItem(
  workspaceId: string,
  companyId: string,
  item: Omit<RecentItem, "openedAt">,
): RecentItem[] {
  if (typeof window === "undefined") {
    return listRecentItems(workspaceId, companyId);
  }
  if (!isRecentItemEntityType(item.entityType)) {
    return listRecentItems(workspaceId, companyId);
  }

  const next: RecentItem[] = [
    { ...item, openedAt: new Date().toISOString() },
    ...listRecentItems(workspaceId, companyId).filter(
      (entry) =>
        !(
          entry.entityType === item.entityType &&
          entry.entityId === item.entityId
        ),
    ),
  ].slice(0, MAX_RECENT);

  window.localStorage.setItem(
    storageKey(workspaceId, companyId),
    JSON.stringify(next),
  );
  return next;
}

export function isRememberableEntityType(
  entityType: string,
): entityType is RecentItemEntityType {
  return isRecentItemEntityType(entityType);
}
