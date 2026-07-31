/**
 * Search Foundation — contracts + prepare/rank helpers (Project 046).
 *
 * No indexing engine · No database FTS · No UI · No persistence.
 */

export type {
  PreparedSearch,
  SearchEntityType,
  SearchFilter,
  SearchHit,
  SearchObject,
  SearchObjectId,
  SearchObjectModel,
  SearchSortOrder,
} from "@/core/search/types";

export {
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT,
  MAX_SEARCH_QUERY_LENGTH,
  SEARCH_ENTITY_TYPES,
  SEARCH_FILTERS,
  SEARCH_SORT_ORDERS,
} from "@/core/search/constants";

export type {
  CreateSearchObjectInput,
  ReindexSearchInput,
  RemoveSearchObjectInput,
  SearchObjectIdInput,
  SearchQueryInput,
} from "@/core/search/schema";

export {
  createSearchObjectSchema,
  reindexSearchSchema,
  removeSearchObjectSchema,
  searchEntityTypeSchema,
  searchFilterSchema,
  searchObjectIdSchema,
  searchObjectSchema,
  searchQuerySchema,
  searchSortOrderSchema,
} from "@/core/search/schema";

export type { SearchFilterState } from "@/core/search/filters";
export {
  applySearchFilters,
  emptySearchFilterState,
  isSearchFilter,
  normalizeSearchFilters,
} from "@/core/search/filters";

export type { SearchRepository } from "@/core/search/repository";

export type { SearchService } from "@/core/search/service";
export {
  buildSearchDocument,
  buildSearchIndex,
  extractKeywords,
  normalizeQuery,
  prepareSearch,
  rankResults,
  tokenizeKeywords,
  validateCreateSearchObject,
  validateReindexSearch,
  validateRemoveSearchObject,
  validateSearchQuery,
  validateSearchQueryInput,
} from "@/core/search/service";
