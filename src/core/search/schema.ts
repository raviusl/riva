import { z } from "zod";

import {
  DEFAULT_SEARCH_LIMIT,
  MAX_SEARCH_LIMIT,
  MAX_SEARCH_QUERY_LENGTH,
  SEARCH_ENTITY_TYPES,
  SEARCH_SORT_ORDERS,
} from "@/core/search/constants";

export const searchEntityTypeSchema = z.enum(SEARCH_ENTITY_TYPES);
export const searchFilterSchema = searchEntityTypeSchema;
export const searchSortOrderSchema = z.enum(SEARCH_SORT_ORDERS);

export const searchObjectIdSchema = z.object({
  searchObjectId: z.string().uuid(),
});

export type SearchObjectIdInput = z.infer<typeof searchObjectIdSchema>;

export const searchObjectSchema = z.object({
  id: z.string().uuid(),
  entityType: searchEntityTypeSchema,
  entityId: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(500),
  subtitle: z.string().max(1000).nullable(),
  keywords: z.array(z.string().min(1).max(100)).max(100),
  tags: z.array(z.string().min(1).max(64)).max(50),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const createSearchObjectSchema = z.object({
  entityType: searchEntityTypeSchema,
  entityId: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  title: z.string().min(1).max(500),
  subtitle: z.string().max(1000).optional().nullable(),
  keywords: z.array(z.string().min(1).max(100)).max(100).optional().default([]),
  tags: z.array(z.string().min(1).max(64)).max(50).optional().default([]),
});

export type CreateSearchObjectInput = z.infer<typeof createSearchObjectSchema>;

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(MAX_SEARCH_QUERY_LENGTH),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid().optional().nullable(),
  entityTypes: z.array(searchEntityTypeSchema).optional(),
  tags: z.array(z.string().min(1).max(64)).optional(),
  limit: z
    .number()
    .int()
    .positive()
    .max(MAX_SEARCH_LIMIT)
    .optional()
    .default(DEFAULT_SEARCH_LIMIT),
  sort: searchSortOrderSchema.optional().default("relevance"),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export const removeSearchObjectSchema = z.object({
  entityType: searchEntityTypeSchema,
  entityId: z.string().uuid(),
  companyId: z.string().uuid(),
});

export type RemoveSearchObjectInput = z.infer<typeof removeSearchObjectSchema>;

export const reindexSearchSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid().optional().nullable(),
  entityTypes: z.array(searchEntityTypeSchema).optional(),
});

export type ReindexSearchInput = z.infer<typeof reindexSearchSchema>;
