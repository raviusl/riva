import type {
  CreateSearchObjectInput,
  ReindexSearchInput,
  RemoveSearchObjectInput,
  SearchQueryInput,
} from "@/core/search/schema";
import type {
  SearchHit,
  SearchObject,
  SearchObjectId,
} from "@/core/search/types";

/**
 * Search persistence / index contract — implementation deferred.
 * No database / full-text search in Project 046.
 */
export interface SearchRepository {
  search(query: SearchQueryInput): Promise<SearchHit[]>;
  index(input: CreateSearchObjectInput): Promise<SearchObject>;
  remove(input: RemoveSearchObjectInput): Promise<void>;
  reindex(input: ReindexSearchInput): Promise<number>;
  findById(searchObjectId: SearchObjectId): Promise<SearchObject | null>;
}
