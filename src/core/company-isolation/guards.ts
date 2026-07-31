/**
 * Reusable Company Isolation guards for future repositories (Project 043).
 * Every repository can accept companyId without changing business logic.
 */

import { COMPANY_SCOPE_FIELD } from "@/core/company-isolation/constants";
import { CoreError } from "@/core/errors";
import {
  assertSameCompany,
  isCompanyScoped,
  requireCompany,
  toCompanyFilter,
  toCompanyScope,
} from "@/core/company-isolation/service";
import type {
  CompanyFilter,
  CompanyId,
  CompanyScope,
  CompanyScoped,
  IsolationGuardResult,
} from "@/core/company-isolation/types";

export type WithCompanyId<T extends object = object> = T & {
  companyId: CompanyId;
};

/**
 * Ensure an input object carries a valid companyId.
 * Returns a typed copy for repository query builders.
 */
export function guardCompanyId<T extends object>(
  input: T & { companyId?: string | null },
): WithCompanyId<T> {
  const companyId = requireCompany(input.companyId);
  return { ...input, companyId };
}

/**
 * Apply company filter to a query-shaped object without altering other fields.
 */
export function applyCompanyFilter<T extends object>(
  query: T,
  companyId: string,
): T & CompanyFilter {
  return {
    ...query,
    ...toCompanyFilter(companyId),
  };
}

/**
 * Attach CompanyScope metadata for repository list/get calls.
 */
export function applyCompanyScope<T extends object>(
  query: T,
  companyId: string,
  mode: CompanyScope["mode"] = "strict",
): T & CompanyScope {
  return {
    ...query,
    ...toCompanyScope(companyId, mode),
  };
}

/**
 * Soft guard: returns ok/fail without throwing (for optional isolation mode).
 */
export function checkCompanyIsolation(
  record: CompanyScoped | null | undefined,
  companyId: string | null | undefined,
): IsolationGuardResult {
  try {
    const scoped = requireCompany(companyId);
    if (!isCompanyScoped(record, scoped)) {
      return {
        ok: false,
        code: "COMPANY_SCOPE_DENIED",
        message: "Record is outside the current company boundary.",
      };
    }
    return { ok: true, companyId: scoped };
  } catch (error) {
    if (error instanceof CoreError) {
      return { ok: false, code: error.code, message: error.message };
    }
    return {
      ok: false,
      code: "COMPANY_ISOLATION_FAILED",
      message: "Company isolation check failed.",
    };
  }
}

/**
 * Hard guard: throws when a loaded record is outside company scope.
 * Use after repository findById before returning to callers.
 */
export function assertRecordCompany(
  record: CompanyScoped | null | undefined,
  companyId: string,
): asserts record is CompanyScoped {
  const scoped = requireCompany(companyId);
  if (!record) {
    throw new CoreError("NOT_FOUND", "Record not found.");
  }
  if (!isCompanyScoped(record, scoped)) {
    throw new CoreError(
      "COMPANY_SCOPE_DENIED",
      "Record is outside the current company boundary.",
    );
  }
}

/**
 * Guard that two write/read company ids match before mutating.
 */
export function assertCompanyBoundary(
  expectedCompanyId: string,
  actualCompanyId: string | null | undefined,
): void {
  assertSameCompany(expectedCompanyId, actualCompanyId);
}

/** Stable company scope field name for repository column mapping. */
export function companyScopeField(): typeof COMPANY_SCOPE_FIELD {
  return COMPANY_SCOPE_FIELD;
}
