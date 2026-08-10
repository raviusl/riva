import type {
  WeddingPackageSummary,
  WeddingProjectPackageWithItems,
} from "@/core/wedding-package/types";

export function packageLineTotal(quantity: number, unitPrice: number): number {
  return Math.round((quantity * unitPrice + Number.EPSILON) * 100) / 100;
}

export function packageValue(
  pkg: Pick<WeddingProjectPackageWithItems, "items">,
): number {
  return (
    Math.round(
      (pkg.items
        .filter((item) => item.is_included)
        .reduce(
          (sum, item) => sum + packageLineTotal(item.quantity, item.unit_price),
          0,
        ) +
        Number.EPSILON) *
        100,
    ) / 100
  );
}

export function summarizeWeddingPackages(
  packages: WeddingProjectPackageWithItems[],
): WeddingPackageSummary {
  const active = packages.filter((pkg) => !pkg.archived_at);
  const currency = active[0]?.currency ?? "MYR";
  let itemCount = 0;
  let totalValue = 0;
  let confirmedValue = 0;
  for (const pkg of active) {
    itemCount += pkg.items.length;
    const value = packageValue(pkg);
    totalValue += value;
    if (pkg.status === "confirmed") confirmedValue += value;
  }
  return {
    packageCount: active.length,
    itemCount,
    totalValue: Math.round((totalValue + Number.EPSILON) * 100) / 100,
    confirmedValue: Math.round((confirmedValue + Number.EPSILON) * 100) / 100,
    currency,
  };
}
