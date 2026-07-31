/**
 * Search Foundation constants (Project 046).
 */

export const SEARCH_ENTITY_TYPES = [
  "workspace",
  "project",
  "meeting",
  "client",
  "vendor",
  "task",
  "timeline",
  "document",
  "finance",
  "notification",
  "automation",
] as const;

export type SearchEntityType = (typeof SEARCH_ENTITY_TYPES)[number];

/** Alias for filter catalog — same entity surface. */
export const SEARCH_FILTERS = SEARCH_ENTITY_TYPES;
export type SearchFilter = SearchEntityType;

export const SEARCH_SORT_ORDERS = ["relevance", "updated_desc", "created_desc"] as const;
export type SearchSortOrder = (typeof SEARCH_SORT_ORDERS)[number];

export const DEFAULT_SEARCH_LIMIT = 25;
export const MAX_SEARCH_LIMIT = 100;
export const MAX_SEARCH_QUERY_LENGTH = 200;
