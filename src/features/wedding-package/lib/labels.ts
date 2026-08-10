import { uiZh } from "@/config/ui-zh";
import type { WeddingPackageStatus } from "@/core/wedding-package/constants";
import {
  packageLineTotal,
  packageValue,
} from "@/core/wedding-package/value";

export function formatPackageStatus(
  status: WeddingPackageStatus | string,
): string {
  switch (status) {
    case "draft":
      return uiZh.wpStatusDraft;
    case "confirmed":
      return uiZh.wpStatusConfirmed;
    case "cancelled":
      return uiZh.wpStatusCancelled;
    case "archived":
      return uiZh.wpStatusArchived;
    default:
      return status;
  }
}

export function packageStatusTone(status: WeddingPackageStatus | string): string {
  switch (status) {
    case "draft":
      return "bg-white/10 text-white/70";
    case "confirmed":
      return "bg-emerald-500/20 text-emerald-200";
    case "cancelled":
      return "bg-rose-500/15 text-rose-200/80";
    case "archived":
      return "bg-white/8 text-white/40";
    default:
      return "bg-white/10 text-white/70";
  }
}

export function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export { packageLineTotal, packageValue };
