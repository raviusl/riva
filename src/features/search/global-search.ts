/**
 * Global Search service (Project 048).
 * Reuses Search Foundation prepare/tokenize helpers.
 * No FTS · No indexing · No persistence · No UI.
 */

import { requireCompany } from "@/core/company-isolation";
import { prepareSearch } from "@/core/search";
import {
  groupResults,
  type GlobalSearchGroup,
} from "@/features/search/search-groups";
import {
  buildPreview,
  type GlobalSearchPreview,
} from "@/features/search/search-preview";
import {
  rankResults as rankGlobalResults,
  type GlobalSearchRankContext,
} from "@/features/search/search-ranking";
import type {
  GlobalSearchDocument,
  GlobalSearchResult,
} from "@/features/search/search-result";

export type SearchEverythingInput = {
  query: string;
  companyId: string;
  workspaceId?: string | null;
  /** Candidate documents from callers / future index adapters. */
  documents?: readonly GlobalSearchDocument[];
  sessionKey?: string;
  topMatchesLimit?: number;
  rememberQuery?: boolean;
};

export type SearchEverythingResult = {
  query: string;
  results: GlobalSearchResult[];
  groups: GlobalSearchGroup[];
  preview: GlobalSearchPreview;
};

/**
 * Run Global Search over in-memory Search Foundation documents.
 * Does not hit a database or search index.
 */
export function searchEverything(
  input: SearchEverythingInput,
): SearchEverythingResult {
  const companyId = requireCompany(input.companyId);
  const prepared = prepareSearch({
    query: input.query,
    companyId,
    workspaceId: input.workspaceId ?? null,
  });

  const documents = input.documents ?? [];
  const results = rankGlobalResults(documents, {
    query: prepared.query,
    companyId,
    workspaceId: prepared.workspaceId,
  });
  const groups = groupResults(results);
  const preview = buildPreview({
    query: prepared.query,
    groups,
    sessionKey: input.sessionKey,
    topMatchesLimit: input.topMatchesLimit,
    rememberQuery: input.rememberQuery,
  });

  return {
    query: prepared.query,
    results,
    groups,
    preview,
  };
}

export function rankResults(
  objects: readonly GlobalSearchDocument[],
  context: GlobalSearchRankContext,
): GlobalSearchResult[] {
  return rankGlobalResults(objects, context);
}

export { groupResults, buildPreview };
