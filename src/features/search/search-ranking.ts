/**
 * Global Search ranking (Project 048).
 * Rules: exact title · keyword · recent activity · entity priority · company/workspace scope.
 * In-memory only — no FTS / index provider.
 */

import { prepareSearch, tokenizeKeywords } from "@/core/search";
import {
  getSearchGroupByEntityType,
  groupIdForEntityType,
} from "@/features/search/search-groups";
import type {
  GlobalSearchDocument,
  GlobalSearchMatchReason,
  GlobalSearchResult,
} from "@/features/search/search-result";

export type GlobalSearchRankContext = {
  query: string;
  companyId: string;
  workspaceId?: string | null;
  /** Prefer results updated within this many days for recent-activity boost. */
  recentActivityDays?: number;
};

const EXACT_TITLE_SCORE = 100;
const KEYWORD_TITLE_SCORE = 40;
const KEYWORD_SUBTITLE_SCORE = 20;
const KEYWORD_TAG_SCORE = 15;
const KEYWORD_FIELD_SCORE = 10;
const RECENT_ACTIVITY_SCORE = 25;
const COMPANY_SCOPE_SCORE = 30;
const WORKSPACE_SCOPE_SCORE = 20;

function daysBetween(iso: string, now: Date): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - then) / (1000 * 60 * 60 * 24);
}

function isExactTitleMatch(title: string, query: string): boolean {
  return title.trim().toLowerCase() === query.trim().toLowerCase();
}

/**
 * Rank Search Foundation documents for Global Search.
 * Reuses prepareSearch / tokenizeKeywords; adds scope + entity priority.
 */
export function rankResults(
  objects: readonly GlobalSearchDocument[],
  context: GlobalSearchRankContext,
): GlobalSearchResult[] {
  const prepared = prepareSearch({
    query: context.query,
    companyId: context.companyId,
    workspaceId: context.workspaceId ?? null,
  });
  const tokens =
    prepared.tokens.length > 0
      ? prepared.tokens
      : tokenizeKeywords(context.query);
  const now = new Date();
  const recentDays = context.recentActivityDays ?? 14;

  const ranked: GlobalSearchResult[] = [];

  for (const object of objects) {
    // Company scope is mandatory for Global Search candidates.
    if (object.companyId !== context.companyId) continue;

    const title = object.title.toLowerCase();
    const subtitle = (object.subtitle ?? "").toLowerCase();
    const keywords = object.keywords.map((keyword) => keyword.toLowerCase());
    const tags = object.tags.map((tag) => tag.toLowerCase());
    const matchedBy: GlobalSearchMatchReason[] = ["company_scope"];
    let score = COMPANY_SCOPE_SCORE;

    if (isExactTitleMatch(object.title, prepared.query)) {
      score += EXACT_TITLE_SCORE;
      matchedBy.push("exact_title");
    }

    let keywordHits = 0;
    for (const token of tokens) {
      if (title.includes(token)) {
        score += KEYWORD_TITLE_SCORE;
        keywordHits += 1;
      }
      if (subtitle.includes(token)) {
        score += KEYWORD_SUBTITLE_SCORE;
        keywordHits += 1;
      }
      if (keywords.includes(token)) {
        score += KEYWORD_FIELD_SCORE;
        keywordHits += 1;
      }
      if (tags.includes(token)) {
        score += KEYWORD_TAG_SCORE;
        keywordHits += 1;
      }
    }
    if (keywordHits > 0) {
      matchedBy.push("keyword");
    }

    const ageDays = daysBetween(object.updatedAt, now);
    if (ageDays <= recentDays) {
      const recencyBoost = Math.max(
        0,
        RECENT_ACTIVITY_SCORE * (1 - ageDays / recentDays),
      );
      score += recencyBoost;
      matchedBy.push("recent_activity");
    }

    const group = getSearchGroupByEntityType(object.entityType);
    if (group) {
      score += group.priority / 10;
      matchedBy.push("entity_priority");
    }

    if (context.workspaceId && object.workspaceId === context.workspaceId) {
      score += WORKSPACE_SCOPE_SCORE;
      matchedBy.push("workspace_scope");
    }

    // Drop non-matches unless exact title already matched.
    if (!matchedBy.includes("exact_title") && !matchedBy.includes("keyword")) {
      continue;
    }

    ranked.push({
      id: object.id,
      groupId: groupIdForEntityType(object.entityType),
      entityType: object.entityType,
      entityId: object.entityId,
      companyId: object.companyId,
      workspaceId: object.workspaceId,
      title: object.title,
      subtitle: object.subtitle,
      keywords: object.keywords,
      tags: object.tags,
      href: object.href ?? null,
      score,
      matchedBy,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
    });
  }

  return ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}
