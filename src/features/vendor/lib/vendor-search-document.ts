/**
 * Vendor → Global Search document adapter (Project 053).
 */

import type { Vendor } from "@/core/types";
import type { GlobalSearchDocument } from "@/features/search/search-result";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

export function toVendorSearchDocument(
  vendor: Vendor,
): GlobalSearchDocument & { href: string } {
  const keywords = [
    vendor.name,
    vendor.company_name,
    vendor.contact_person,
    vendor.email,
    vendor.phone,
    vendor.category,
    vendor.status,
  ].filter((value): value is string => Boolean(value && value.trim()));

  return {
    id: `vendor:${vendor.id}`,
    entityType: "vendor",
    entityId: vendor.id,
    companyId: vendor.company_id,
    workspaceId: vendor.workspace_id,
    title: vendor.name,
    subtitle: [vendor.category, vendor.company_name, vendor.status]
      .filter(Boolean)
      .join(" · "),
    keywords,
    tags: [
      vendor.status,
      ...(vendor.category ? [vendor.category] : []),
    ],
    createdAt: vendor.created_at,
    updatedAt: vendor.updated_at,
    href: buildWorkspaceOverviewHref("vendor", vendor.id),
  };
}

export function toVendorSearchDocuments(
  vendors: readonly Vendor[],
): Array<GlobalSearchDocument & { href: string }> {
  return vendors
    .filter((vendor) => vendor.status !== "archived")
    .map(toVendorSearchDocument);
}
