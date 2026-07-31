/**
 * Global Search preview architecture (Project 048).
 * Grouped results · top matches · session recent searches · keyboard placeholders.
 */

import type { GlobalSearchGroup } from "@/features/search/search-groups";
import type { GlobalSearchResult } from "@/features/search/search-result";
import {
  DEFAULT_SEARCH_SHORTCUTS,
  type SearchShortcut,
} from "@/features/search/search-shortcuts";

export type RecentSearchEntry = {
  query: string;
  searchedAt: string;
};

export type GlobalSearchPreview = {
  query: string;
  groups: GlobalSearchGroup[];
  topMatches: GlobalSearchResult[];
  recentSearches: RecentSearchEntry[];
  shortcuts: SearchShortcut[];
  /** Keyboard navigation placeholders for future UI. */
  keyboard: {
    open: string;
    next: string;
    previous: string;
    select: string;
    close: string;
  };
};

const DEFAULT_TOP_MATCHES = 5;
const MAX_RECENT_SEARCHES = 8;

/** In-memory session recent searches (no persistence). */
const sessionRecentSearches = new Map<string, RecentSearchEntry[]>();

export function rememberRecentSearch(
  sessionKey: string,
  query: string,
): RecentSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return listRecentSearches(sessionKey);

  const existing = listRecentSearches(sessionKey).filter(
    (entry) => entry.query.toLowerCase() !== trimmed.toLowerCase(),
  );
  const next: RecentSearchEntry[] = [
    { query: trimmed, searchedAt: new Date().toISOString() },
    ...existing,
  ].slice(0, MAX_RECENT_SEARCHES);

  sessionRecentSearches.set(sessionKey, next);
  return next;
}

export function listRecentSearches(sessionKey: string): RecentSearchEntry[] {
  return [...(sessionRecentSearches.get(sessionKey) ?? [])];
}

export function clearRecentSearches(sessionKey: string): void {
  sessionRecentSearches.delete(sessionKey);
}

export type BuildPreviewInput = {
  query: string;
  groups: GlobalSearchGroup[];
  sessionKey?: string;
  topMatchesLimit?: number;
  rememberQuery?: boolean;
};

/**
 * Build a Global Search preview payload for future command-palette UI.
 */
export function buildPreview(input: BuildPreviewInput): GlobalSearchPreview {
  const sessionKey = input.sessionKey ?? "default";
  const recentSearches =
    input.rememberQuery === false
      ? listRecentSearches(sessionKey)
      : rememberRecentSearch(sessionKey, input.query);

  const flat = input.groups.flatMap((group) => group.results);
  const topMatches = flat.slice(0, input.topMatchesLimit ?? DEFAULT_TOP_MATCHES);

  return {
    query: input.query,
    groups: input.groups,
    topMatches,
    recentSearches,
    shortcuts: [...DEFAULT_SEARCH_SHORTCUTS],
    keyboard: {
      open: "meta+k",
      next: "arrowdown",
      previous: "arrowup",
      select: "enter",
      close: "escape",
    },
  };
}
