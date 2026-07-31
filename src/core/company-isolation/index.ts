/**
 * Company Isolation foundation — contracts + guards (Project 043).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 *
 * No RBAC · No auth changes · No persistence · No UI / Workspace redesign.
 */

export type {
  CompanyContext,
  CompanyFilter,
  CompanyId,
  CompanyIsolationMode,
  CompanyScope,
  CompanyScoped,
  CurrentCompany,
  IsolationGuardResult,
} from "@/core/company-isolation/types";

export {
  COMPANY_ISOLATION_MODES,
  COMPANY_SCOPE_FIELD,
} from "@/core/company-isolation/constants";

export type {
  CompanyContextInput,
  CompanyFilterInput,
  CompanyScopeInput,
  CompanyScopedRecordInput,
  CurrentCompanyInput,
} from "@/core/company-isolation/schema";

export {
  companyContextSchema,
  companyFilterSchema,
  companyIdSchema,
  companyIsolationModeSchema,
  companyScopeSchema,
  companyScopedRecordSchema,
  currentCompanySchema,
} from "@/core/company-isolation/schema";

export type { CompanyIsolationRepository } from "@/core/company-isolation/repository";

export type { CompanyIsolationService } from "@/core/company-isolation/service";
export {
  assertSameCompany,
  filterByCompany,
  isCompanyScoped,
  requireCompany,
  toCompanyFilter,
  toCompanyScope,
  validateCompanyContext,
  validateCompanyFilter,
  validateCompanyScope,
  validateCurrentCompany,
} from "@/core/company-isolation/service";

export type { WithCompanyId } from "@/core/company-isolation/guards";
export {
  applyCompanyFilter,
  applyCompanyScope,
  assertCompanyBoundary,
  assertRecordCompany,
  checkCompanyIsolation,
  companyScopeField,
  guardCompanyId,
} from "@/core/company-isolation/guards";
