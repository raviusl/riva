/**
 * Company Isolation types — platform foundation (Project 043).
 * Every query / repository / service is designed around company boundaries.
 * RBAC and auth changes are deferred.
 */

import type { CompanyIsolationMode } from "@/core/company-isolation/constants";

export type { CompanyIsolationMode } from "@/core/company-isolation/constants";

export type CompanyId = string;

/** The active company for the current request / session projection. */
export type CurrentCompany = {
  id: CompanyId;
  name?: string | null;
};

/**
 * Company Context — tenancy boundary carried into services and repositories.
 * Workspace may be present but company isolation is always by companyId.
 */
export type CompanyContext = {
  companyId: CompanyId;
  workspaceId?: string | null;
  actorId?: string | null;
};

/** Declares that a query or write is scoped to one company. */
export type CompanyScope = {
  companyId: CompanyId;
  mode?: CompanyIsolationMode;
};

/** Filter fragment future repositories apply to list/get queries. */
export type CompanyFilter = {
  companyId: CompanyId;
};

/** Any record that carries a company boundary. */
export type CompanyScoped = {
  companyId: CompanyId;
};

/**
 * Isolation Guard — reusable check result for repository helpers.
 * Does not change business logic; only validates company boundaries.
 */
export type IsolationGuardResult =
  | { ok: true; companyId: CompanyId }
  | { ok: false; code: string; message: string };
