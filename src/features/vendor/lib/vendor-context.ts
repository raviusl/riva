import type { Vendor } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

export type VendorContextValue = {
  workspaceId: string | null;
  companyId: string | null;
  vendors: Vendor[];
};

export function toVendorContextValue(input: {
  workspaceId: string | null;
  companyId: string | null;
  vendors: Vendor[];
}): VendorContextValue {
  return {
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    vendors: input.vendors,
  };
}

export function vendorCategoryLabel(
  category: Vendor["category"],
): string {
  if (!category) return uiZh.unspecified;
  const labels: Record<NonNullable<Vendor["category"]>, string> = {
    photographer: uiZh.vendorPhotographer,
    videographer: uiZh.vendorVideographer,
    decorator: uiZh.vendorDecorator,
    makeup_artist: uiZh.vendorMakeupArtist,
    live_band: uiZh.vendorLiveBand,
    emcee: uiZh.vendorEmcee,
    venue: uiZh.vendorVenue,
    catering: uiZh.vendorCatering,
    florist: uiZh.vendorFlorist,
    others: uiZh.vendorOthers,
  };
  return labels[category];
}
