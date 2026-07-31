/**
 * Global Search groups (Project 048).
 */

import { uiZh } from "@/config/ui-zh";
import type { SearchEntityType } from "@/core/search";
import type {
  GlobalSearchEntityType,
  GlobalSearchGroupId,
  GlobalSearchResult,
} from "@/features/search/search-result";

export type GlobalSearchGroupDefinition = {
  id: GlobalSearchGroupId;
  label: string;
  entityType: GlobalSearchEntityType;
  /** Higher = stronger entity priority boost in ranking. */
  priority: number;
};

export const GLOBAL_SEARCH_GROUPS: readonly GlobalSearchGroupDefinition[] = [
  {
    id: "commands",
    label: uiZh.searchGroupCommands,
    entityType: "command",
    priority: 120,
  },
  {
    id: "clients",
    label: uiZh.searchGroupClients,
    entityType: "client",
    priority: 95,
  },
  {
    id: "projects",
    label: uiZh.searchGroupProjects,
    entityType: "project",
    priority: 100,
  },
  { id: "tasks", label: uiZh.searchGroupTasks, entityType: "task", priority: 92 },
  {
    id: "meetings",
    label: uiZh.searchGroupMeetings,
    entityType: "meeting",
    priority: 90,
  },
  {
    id: "vendors",
    label: uiZh.searchGroupVendors,
    entityType: "vendor",
    priority: 85,
  },
  {
    id: "documents",
    label: uiZh.searchGroupFiles,
    entityType: "document",
    priority: 88,
  },
  {
    id: "finance",
    label: uiZh.searchGroupFinance,
    entityType: "finance",
    priority: 55,
  },
  {
    id: "members",
    label: uiZh.searchGroupTeamMembers,
    entityType: "member",
    priority: 82,
  },
  {
    id: "settings",
    label: uiZh.searchGroupSettings,
    entityType: "settings",
    priority: 78,
  },
  {
    id: "workspace",
    label: uiZh.searchGroupWorkspace,
    entityType: "workspace",
    priority: 70,
  },
  {
    id: "timeline",
    label: uiZh.searchGroupTimeline,
    entityType: "timeline",
    priority: 60,
  },
  {
    id: "notifications",
    label: uiZh.searchGroupNotifications,
    entityType: "notification",
    priority: 50,
  },
  {
    id: "automation",
    label: uiZh.searchGroupAutomation,
    entityType: "automation",
    priority: 45,
  },
  {
    id: "company",
    label: uiZh.searchGroupCompany,
    entityType: "company",
    priority: 40,
  },
] as const;

export type GlobalSearchGroup = {
  id: GlobalSearchGroupId;
  label: string;
  results: GlobalSearchResult[];
};

const GROUP_BY_ENTITY = new Map(
  GLOBAL_SEARCH_GROUPS.map((group) => [group.entityType, group]),
);

export function getSearchGroupByEntityType(
  entityType: GlobalSearchEntityType,
): GlobalSearchGroupDefinition | undefined {
  return GROUP_BY_ENTITY.get(entityType);
}

export function getSearchGroupById(
  id: GlobalSearchGroupId,
): GlobalSearchGroupDefinition | undefined {
  return GLOBAL_SEARCH_GROUPS.find((group) => group.id === id);
}

export function entityTypeForGroup(
  groupId: GlobalSearchGroupId,
): GlobalSearchEntityType {
  return getSearchGroupById(groupId)?.entityType ?? "workspace";
}

export function groupIdForEntityType(
  entityType: SearchEntityType | GlobalSearchEntityType,
): GlobalSearchGroupId {
  return getSearchGroupByEntityType(entityType)?.id ?? "workspace";
}

/**
 * Bucket ranked results into labeled groups (empty groups omitted).
 * Group order follows GLOBAL_SEARCH_GROUPS priority catalog.
 */
export function groupResults(
  results: readonly GlobalSearchResult[],
): GlobalSearchGroup[] {
  const buckets = new Map<GlobalSearchGroupId, GlobalSearchResult[]>();

  for (const result of results) {
    const list = buckets.get(result.groupId) ?? [];
    list.push(result);
    buckets.set(result.groupId, list);
  }

  return GLOBAL_SEARCH_GROUPS.flatMap((definition) => {
    const items = buckets.get(definition.id);
    if (!items || items.length === 0) return [];
    return [
      {
        id: definition.id,
        label: definition.label,
        results: items,
      },
    ];
  });
}
