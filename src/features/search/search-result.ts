/**
 * Global Search result shapes (Project 048).
 * Reuses Search Foundation SearchObject / SearchHit contracts.
 */

import type { SearchEntityType, SearchHit, SearchObject } from "@/core/search";

/** Feature-level entity types including Company (not in foundation catalog). */
export type GlobalSearchEntityType =
  | SearchEntityType
  | "company"
  | "settings"
  | "member"
  | "command";

/** Search Foundation document widened for Global Search (adds company). */
export type GlobalSearchDocument = Omit<SearchObject, "entityType" | "workspaceId"> & {
  entityType: GlobalSearchEntityType;
  workspaceId: string | null;
  /** Navigation target for Universal Search (Project 072). */
  href?: string | null;
};

export type GlobalSearchResult = {
  id: string;
  groupId: GlobalSearchGroupId;
  entityType: GlobalSearchEntityType;
  entityId: string;
  companyId: string;
  workspaceId: string | null;
  title: string;
  subtitle: string | null;
  keywords: string[];
  tags: string[];
  href: string | null;
  score: number;
  matchedBy: GlobalSearchMatchReason[];
  createdAt: string;
  updatedAt: string;
};

export type GlobalSearchMatchReason =
  | "exact_title"
  | "keyword"
  | "recent_activity"
  | "entity_priority"
  | "company_scope"
  | "workspace_scope";

export type GlobalSearchGroupId =
  | "commands"
  | "projects"
  | "meetings"
  | "clients"
  | "vendors"
  | "tasks"
  | "timeline"
  | "documents"
  | "finance"
  | "notifications"
  | "automation"
  | "workspace"
  | "company"
  | "settings"
  | "members";

export function toGlobalSearchResult(
  hit: SearchHit | (GlobalSearchDocument & { score: number }),
  groupId: GlobalSearchGroupId,
  matchedBy: GlobalSearchMatchReason[] = [],
  href: string | null = null,
): GlobalSearchResult {
  return {
    id: hit.id,
    groupId,
    entityType: hit.entityType,
    entityId: hit.entityId,
    companyId: hit.companyId,
    workspaceId: hit.workspaceId,
    title: hit.title,
    subtitle: hit.subtitle,
    keywords: hit.keywords,
    tags: hit.tags,
    href,
    score: hit.score,
    matchedBy,
    createdAt: hit.createdAt,
    updatedAt: hit.updatedAt,
  };
}

export function fromSearchObject(
  object: GlobalSearchDocument,
  score: number,
  groupId: GlobalSearchGroupId,
  matchedBy: GlobalSearchMatchReason[] = [],
): GlobalSearchResult {
  return toGlobalSearchResult({ ...object, score }, groupId, matchedBy);
}
