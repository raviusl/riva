import type {
  CompanyContext,
  CompanyFilter,
  CompanyId,
  CompanyScope,
  CurrentCompany,
} from "@/core/company-isolation/types";

/**
 * Company Isolation persistence contract — implementation deferred.
 * No database changes or migrations in Project 043.
 */
export interface CompanyIsolationRepository {
  getCurrentCompany(actorId: string): Promise<CurrentCompany | null>;
  resolveCompanyContext(actorId: string): Promise<CompanyContext | null>;
  buildCompanyFilter(companyId: CompanyId): Promise<CompanyFilter>;
  buildCompanyScope(companyId: CompanyId): Promise<CompanyScope>;
}
