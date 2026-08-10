/**
 * Project 102 — Wedding Project Package constants.
 */

export const WEDDING_PACKAGE_STATUSES = [
  "draft",
  "confirmed",
  "cancelled",
  "archived",
] as const;
export type WeddingPackageStatus = (typeof WEDDING_PACKAGE_STATUSES)[number];

export const WEDDING_PACKAGE_CURRENCIES = [
  "MYR",
  "SGD",
  "USD",
  "IDR",
  "THB",
  "CNY",
] as const;
