/**
 * Client-side recent searches for Universal Search (max 8).
 */

const STORAGE_PREFIX = "riva.os.universal-search.recent.v1";
const MAX_RECENT = 8;

export type RecentSearchEntry = {
  query: string;
  searchedAt: string;
};

function storageKey(workspaceId: string, companyId: string): string {
  return `${STORAGE_PREFIX}:${workspaceId}:${companyId}`;
}

export function listRecentSearches(
  workspaceId: string,
  companyId: string,
): RecentSearchEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(workspaceId, companyId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearchEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function rememberRecentSearch(
  workspaceId: string,
  companyId: string,
  query: string,
): RecentSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed || typeof window === "undefined") {
    return listRecentSearches(workspaceId, companyId);
  }

  const next = [
    { query: trimmed, searchedAt: new Date().toISOString() },
    ...listRecentSearches(workspaceId, companyId).filter(
      (entry) => entry.query.toLowerCase() !== trimmed.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT);

  window.localStorage.setItem(
    storageKey(workspaceId, companyId),
    JSON.stringify(next),
  );
  return next;
}
