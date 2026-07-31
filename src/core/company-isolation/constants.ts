/**
 * Company Isolation constants (Project 043).
 */

/** Stable field name repositories use for company scoping. */
export const COMPANY_SCOPE_FIELD = "companyId" as const;

export const COMPANY_ISOLATION_MODES = [
  "strict",
  "optional",
] as const;
export type CompanyIsolationMode = (typeof COMPANY_ISOLATION_MODES)[number];
