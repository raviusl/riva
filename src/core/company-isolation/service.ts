import { CoreError } from "@/core/errors";
import {
  companyContextSchema,
  companyFilterSchema,
  companyIdSchema,
  companyScopeSchema,
  currentCompanySchema,
  type CompanyContextInput,
  type CompanyFilterInput,
  type CompanyScopeInput,
  type CurrentCompanyInput,
} from "@/core/company-isolation/schema";
import type {
  CompanyContext,
  CompanyFilter,
  CompanyId,
  CompanyScope,
  CompanyScoped,
  CurrentCompany,
} from "@/core/company-isolation/types";

/**
 * Company Isolation service contract.
 * Project 043: validation helpers only — no business logic / RBAC.
 */
export interface CompanyIsolationService {
  requireCompany(companyId: string | null | undefined): CompanyId;
  isCompanyScoped(
    record: CompanyScoped | null | undefined,
    companyId: CompanyId,
  ): boolean;
  assertSameCompany(
    left: string | null | undefined,
    right: string | null | undefined,
  ): void;
  filterByCompany<T extends CompanyScoped>(
    records: readonly T[],
    companyId: CompanyId,
  ): T[];
  getCurrentCompany(actorId: string): Promise<CurrentCompany>;
  resolveCompanyContext(actorId: string): Promise<CompanyContext>;
}

/** Validate and return a companyId; throws if missing/invalid. */
export function requireCompany(
  companyId: string | null | undefined,
): CompanyId {
  if (companyId == null || companyId === "") {
    throw new CoreError(
      "COMPANY_REQUIRED",
      "A companyId is required for this operation.",
    );
  }
  try {
    return companyIdSchema.parse(companyId);
  } catch (error) {
    throw new CoreError(
      "COMPANY_INVALID",
      "companyId must be a valid UUID.",
      { cause: error },
    );
  }
}

/** True when the record belongs to the given company. */
export function isCompanyScoped(
  record: CompanyScoped | null | undefined,
  companyId: CompanyId,
): boolean {
  if (!record) return false;
  return record.companyId === companyId;
}

/** Throws when two company ids are missing or do not match. */
export function assertSameCompany(
  left: string | null | undefined,
  right: string | null | undefined,
): void {
  const leftId = requireCompany(left);
  const rightId = requireCompany(right);
  if (leftId !== rightId) {
    throw new CoreError(
      "COMPANY_MISMATCH",
      "Resources must belong to the same company.",
    );
  }
}

/** Returns only records whose companyId matches. */
export function filterByCompany<T extends CompanyScoped>(
  records: readonly T[],
  companyId: CompanyId,
): T[] {
  const scoped = requireCompany(companyId);
  return records.filter((record) => record.companyId === scoped);
}

export function validateCurrentCompany(input: unknown): CurrentCompanyInput {
  return currentCompanySchema.parse(input);
}

export function validateCompanyContext(input: unknown): CompanyContextInput {
  return companyContextSchema.parse(input);
}

export function validateCompanyScope(input: unknown): CompanyScopeInput {
  return companyScopeSchema.parse(input);
}

export function validateCompanyFilter(input: unknown): CompanyFilterInput {
  return companyFilterSchema.parse(input);
}

/** Build a CompanyFilter from a raw companyId (validation only). */
export function toCompanyFilter(companyId: string): CompanyFilter {
  return { companyId: requireCompany(companyId) };
}

/** Build a CompanyScope from a raw companyId (validation only). */
export function toCompanyScope(
  companyId: string,
  mode: CompanyScope["mode"] = "strict",
): CompanyScope {
  return { companyId: requireCompany(companyId), mode };
}
