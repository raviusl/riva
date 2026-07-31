/**
 * Project 056 — OS Foundation entry paths (no app chrome / sidebar).
 */

import { normalizePathname } from "@/lib/auth/routes";

export const OS_WELCOME_PATH = "/dashboard/welcome";
export const OS_BUSINESS_PATH = "/dashboard/business";
export const OS_DIVISION_PATH = "/dashboard/division";
export const OS_ENTER_PATH = "/dashboard/enter";

/** Routes that render the minimal entry shell (no sidebar / switchers). */
export const OS_ENTRY_PATHS = [
  OS_WELCOME_PATH,
  OS_BUSINESS_PATH,
  OS_DIVISION_PATH,
  OS_ENTER_PATH,
  "/dashboard/select-workspace",
  "/dashboard/select-company",
] as const;

export function isOsEntryPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return (OS_ENTRY_PATHS as readonly string[]).includes(path);
}
