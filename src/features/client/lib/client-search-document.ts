/**
 * Client → Global Search document adapter (Project 052).
 */

import type { Client } from "@/core/types";
import type { GlobalSearchDocument } from "@/features/search/search-result";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export function toClientSearchDocument(
  client: Client,
): GlobalSearchDocument & { href: string } {
  const keywords = [
    client.name,
    client.email,
    client.phone,
    client.client_type,
    client.status,
  ].filter((value): value is string => Boolean(value && value.trim()));

  return {
    id: `client:${client.id}`,
    entityType: "client",
    entityId: client.id,
    companyId: client.company_id,
    workspaceId: client.workspace_id,
    title: client.name,
    subtitle: [client.client_type, client.email, client.status]
      .filter(Boolean)
      .join(" · "),
    keywords,
    tags: [
      client.status,
      ...(client.client_type ? [client.client_type] : []),
    ],
    createdAt: client.created_at,
    updatedAt: client.updated_at,
    href: buildWorkspaceOverviewHref("client", client.id),
  };
}

export function toClientSearchDocuments(
  clients: readonly Client[],
): Array<GlobalSearchDocument & { href: string }> {
  return clients
    .filter((client) => client.status !== "archived")
    .map(toClientSearchDocument);
}
