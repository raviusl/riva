import { CoreError } from "@/core/errors";
import { requireCompany } from "@/core/company-isolation";
import {
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_QUERY_LENGTH,
  type SearchEntityType,
} from "@/core/search/constants";
import { normalizeSearchFilters } from "@/core/search/filters";
import {
  createSearchObjectSchema,
  reindexSearchSchema,
  removeSearchObjectSchema,
  searchQuerySchema,
  type CreateSearchObjectInput,
  type ReindexSearchInput,
  type RemoveSearchObjectInput,
  type SearchQueryInput,
} from "@/core/search/schema";
import type {
  PreparedSearch,
  SearchHit,
  SearchObject,
} from "@/core/search/types";

const TOKEN_SPLIT = /[^a-z0-9]+/i;

/**
 * Search domain service contract.
 * Project 046: prepare / document / keyword / rank helpers only.
 */
export interface SearchService {
  prepareSearch(input: unknown): PreparedSearch;
  buildSearchDocument(input: unknown): CreateSearchObjectInput;
  extractKeywords(text: string): string[];
  rankResults(objects: readonly SearchObject[], tokens: string[]): SearchHit[];
  search(query: SearchQueryInput): Promise<SearchHit[]>;
  index(input: CreateSearchObjectInput): Promise<SearchObject>;
  remove(input: RemoveSearchObjectInput): Promise<void>;
  reindex(input: ReindexSearchInput): Promise<number>;
}

/** Trim and collapse whitespace for a search query string. */
export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

/** Validate a raw search query string. */
export function validateSearchQuery(query: string): string {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    throw new CoreError("SEARCH_QUERY_REQUIRED", "Search query is required.");
  }
  if (normalized.length > MAX_SEARCH_QUERY_LENGTH) {
    throw new CoreError(
      "SEARCH_QUERY_TOO_LONG",
      `Search query must be ${MAX_SEARCH_QUERY_LENGTH} characters or fewer.`,
    );
  }
  return normalized;
}

/** Split text into lowercase keyword tokens. */
export function tokenizeKeywords(text: string): string[] {
  const normalized = normalizeQuery(text).toLowerCase();
  if (!normalized) return [];
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const part of normalized.split(TOKEN_SPLIT)) {
    if (part.length < 2) continue;
    if (seen.has(part)) continue;
    seen.add(part);
    tokens.push(part);
  }
  return tokens;
}

/** Extract keywords from one or more text fields. */
export function extractKeywords(
  ...parts: Array<string | null | undefined>
): string[] {
  return tokenizeKeywords(parts.filter(Boolean).join(" "));
}

/**
 * Build a denormalized search index document (validation + keyword fill).
 * Does not write to an index.
 */
export function buildSearchIndex(
  input: unknown,
): CreateSearchObjectInput {
  const values = createSearchObjectSchema.parse(input);
  const autoKeywords = extractKeywords(values.title, values.subtitle);
  const merged = new Set<string>([
    ...values.keywords.map((keyword) => keyword.toLowerCase()),
    ...autoKeywords,
  ]);
  return {
    ...values,
    subtitle: values.subtitle ?? null,
    keywords: [...merged],
    tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
  };
}

/** Alias used by the service surface. */
export function buildSearchDocument(input: unknown): CreateSearchObjectInput {
  return buildSearchIndex(input);
}

/** Prepare a validated search request for future repository execution. */
export function prepareSearch(input: unknown): PreparedSearch {
  const values = searchQuerySchema.parse(input);
  const query = validateSearchQuery(values.query);
  const companyId = requireCompany(values.companyId);
  const tokens = tokenizeKeywords(query);
  const entityTypes = normalizeSearchFilters(values.entityTypes);

  return {
    query,
    tokens,
    companyId,
    workspaceId: values.workspaceId ?? null,
    entityTypes,
    limit: values.limit ?? DEFAULT_SEARCH_LIMIT,
    sort: values.sort ?? "relevance",
  };
}

/**
 * Naive in-memory relevance ranking helper (no FTS engine).
 * Score = title hits * 3 + subtitle hits * 2 + keyword hits.
 */
export function rankResults(
  objects: readonly SearchObject[],
  tokens: string[],
): SearchHit[] {
  if (tokens.length === 0) {
    return objects.map((object) => ({ ...object, score: 0 }));
  }

  const hits: SearchHit[] = objects.map((object) => {
    const title = object.title.toLowerCase();
    const subtitle = (object.subtitle ?? "").toLowerCase();
    const keywords = new Set(object.keywords.map((keyword) => keyword.toLowerCase()));
    let score = 0;
    for (const token of tokens) {
      if (title.includes(token)) score += 3;
      if (subtitle.includes(token)) score += 2;
      if (keywords.has(token)) score += 1;
    }
    return { ...object, score };
  });

  return hits
    .filter((hit) => hit.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function validateSearchQueryInput(input: unknown): SearchQueryInput {
  const values = searchQuerySchema.parse(input);
  validateSearchQuery(values.query);
  requireCompany(values.companyId);
  return values;
}

export function validateCreateSearchObject(
  input: unknown,
): CreateSearchObjectInput {
  return buildSearchIndex(input);
}

export function validateRemoveSearchObject(
  input: unknown,
): RemoveSearchObjectInput {
  return removeSearchObjectSchema.parse(input);
}

export function validateReindexSearch(input: unknown): ReindexSearchInput {
  const values = reindexSearchSchema.parse(input);
  requireCompany(values.companyId);
  return values;
}

export type { SearchEntityType };
