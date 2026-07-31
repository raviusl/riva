/**
 * Shared Search Foundation types — platform foundation (Project 046).
 * Indexing / full-text providers are deferred.
 */

import type {
  SearchEntityType,
  SearchSortOrder,
} from "@/core/search/constants";

export type {
  SearchEntityType,
  SearchFilter,
  SearchSortOrder,
} from "@/core/search/constants";

export type SearchObjectId = string;

/**
 * Search Object — denormalized document contract for future indexing.
 */
export type SearchObject = {
  id: SearchObjectId;
  entityType: SearchEntityType;
  entityId: string;
  companyId: string;
  workspaceId: string;
  title: string;
  subtitle: string | null;
  keywords: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type SearchObjectModel = SearchObject;

export type SearchHit = SearchObject & {
  score: number;
};

export type PreparedSearch = {
  query: string;
  tokens: string[];
  companyId: string;
  workspaceId?: string | null;
  entityTypes?: SearchEntityType[];
  limit: number;
  sort: SearchSortOrder;
};
