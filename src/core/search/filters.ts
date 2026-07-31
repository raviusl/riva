/**
 * Search filter helpers (Project 046).
 * Filter composition only — no index / FTS execution.
 */

import {
  SEARCH_ENTITY_TYPES,
  type SearchEntityType,
  type SearchFilter,
} from "@/core/search/constants";
import type { SearchObject } from "@/core/search/types";

export type SearchFilterState = {
  entityTypes: SearchEntityType[];
  tags: string[];
  workspaceId?: string | null;
};

export function isSearchFilter(value: string): value is SearchFilter {
  return (SEARCH_ENTITY_TYPES as readonly string[]).includes(value);
}

export function normalizeSearchFilters(
  filters: readonly string[] | undefined,
): SearchEntityType[] {
  if (!filters || filters.length === 0) {
    return [...SEARCH_ENTITY_TYPES];
  }
  const unique = new Set<SearchEntityType>();
  for (const filter of filters) {
    if (isSearchFilter(filter)) {
      unique.add(filter);
    }
  }
  return unique.size > 0 ? [...unique] : [...SEARCH_ENTITY_TYPES];
}

/** Apply in-memory filter state to a list of search objects (helper only). */
export function applySearchFilters(
  objects: readonly SearchObject[],
  state: SearchFilterState,
): SearchObject[] {
  const types =
    state.entityTypes.length > 0
      ? new Set(state.entityTypes)
      : new Set(SEARCH_ENTITY_TYPES);
  const tags =
    state.tags.length > 0
      ? new Set(state.tags.map((tag) => tag.toLowerCase()))
      : null;

  return objects.filter((object) => {
    if (!types.has(object.entityType)) return false;
    if (state.workspaceId && object.workspaceId !== state.workspaceId) {
      return false;
    }
    if (tags) {
      const objectTags = object.tags.map((tag) => tag.toLowerCase());
      if (![...tags].every((tag) => objectTags.includes(tag))) {
        return false;
      }
    }
    return true;
  });
}

export function emptySearchFilterState(): SearchFilterState {
  return {
    entityTypes: [...SEARCH_ENTITY_TYPES],
    tags: [],
    workspaceId: null,
  };
}
