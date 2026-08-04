import "server-only";

import { CoreError } from "@/core/errors";
import { requireSlug } from "@/core/lib/slug";
import {
  companyIdSchema,
  createCompanySchema,
  updateCompanySettingsSchema,
  type CompanyIdInput,
  type CreateCompanyInput,
  type UpdateCompanySettingsInput,
} from "@/core/schemas";
import type { Company, CompanyStatus } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import {
  findCompaniesByWorkspace,
  findCompanyById,
  findCompanyBySlug,
  insertCompany,
  updateCompanyById,
} from "@/core/company/repository";

export type { CreateCompanyInput, UpdateCompanySettingsInput };

const EDITABLE_STATUSES: CompanyStatus[] = ["active", "suspended"];

function assertEditable(company: Company): void {
  if (!EDITABLE_STATUSES.includes(company.status)) {
    throw new CoreError(
      "COMPANY_NOT_EDITABLE",
      "Archived companies cannot be edited. Restore the company first.",
    );
  }
}

export async function createCompany(
  input: CreateCompanyInput,
): Promise<Company> {
  const values = createCompanySchema.parse(input);
  await getWorkspaceById(values.workspaceId);

  const slug = requireSlug(values.slug ?? values.name, "company slug");

  try {
    return await insertCompany({
      workspace_id: values.workspaceId,
      name: values.name.trim(),
      slug,
      status: "active",
      type: values.type ?? null,
      logo_url: values.logoUrl?.trim() || null,
      country: values.country?.toUpperCase() ?? null,
      timezone: values.timezone ?? null,
      locale: values.locale ?? null,
      currency: values.currency?.toUpperCase() ?? null,
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "23505") {
      throw new CoreError(
        "COMPANY_SLUG_TAKEN",
        "A company with this slug already exists in the workspace.",
      );
    }
    console.error("createCompany failed", error);
    throw new CoreError("COMPANY_CREATE_FAILED", "Failed to create company.");
  }
}

export async function listCompaniesByWorkspace(
  workspaceId: string,
): Promise<Company[]> {
  await getWorkspaceById(workspaceId);

  try {
    return await findCompaniesByWorkspace(workspaceId);
  } catch (error) {
    console.error("listCompaniesByWorkspace failed", error);
    throw new CoreError("COMPANY_LIST_FAILED", "Failed to list companies.");
  }
}

export async function getCompanyById(
  companyId: string,
  workspaceId?: string,
): Promise<Company> {
  try {
    const company = await findCompanyById(companyId, workspaceId);
    if (!company) {
      throw new CoreError("COMPANY_NOT_FOUND", "Company not found.");
    }
    return company;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getCompanyById failed", error);
    throw new CoreError("COMPANY_LOAD_FAILED", "Failed to load company.");
  }
}

export async function getCompanyBySlug(
  workspaceId: string,
  slug: string,
): Promise<Company> {
  await getWorkspaceById(workspaceId);
  const normalized = requireSlug(slug);

  try {
    const company = await findCompanyBySlug(workspaceId, normalized);
    if (!company) {
      throw new CoreError("COMPANY_NOT_FOUND", "Company not found.");
    }
    return company;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getCompanyBySlug failed", error);
    throw new CoreError("COMPANY_LOAD_FAILED", "Failed to load company.");
  }
}

export async function updateCompanySettings(
  input: UpdateCompanySettingsInput,
): Promise<Company> {
  const values = updateCompanySettingsSchema.parse(input);
  const company = await getCompanyById(values.companyId, values.workspaceId);
  assertEditable(company);

  try {
    return await updateCompanyById(company.id, {
      name: values.name.trim(),
      type: values.type ?? null,
      logo_url: values.logoUrl?.trim() || null,
      country: values.country ? values.country.toUpperCase() : null,
      timezone: values.timezone?.trim() || null,
      locale: values.locale?.trim() || null,
      currency: values.currency ? values.currency.toUpperCase() : null,
      registration_no: values.registrationNo?.trim() || null,
      address: values.address?.trim() || null,
      phone: values.phone?.trim() || null,
      email: values.email?.trim() || null,
      website: values.website?.trim() || null,
      bank_name: values.bankName?.trim() || null,
      bank_account_name: values.bankAccountName?.trim() || null,
      bank_account_number: values.bankAccountNumber?.trim() || null,
      swift_code: values.swiftCode?.trim() || null,
      signature_url: values.signatureUrl?.trim() || null,
      default_payment_terms: values.defaultPaymentTerms?.trim() || null,
      default_terms_and_conditions:
        values.defaultTermsAndConditions?.trim() || null,
      default_document_footer: values.defaultDocumentFooter?.trim() || null,
    });
  } catch (error) {
    console.error("updateCompanySettings failed", error);
    throw new CoreError(
      "COMPANY_UPDATE_FAILED",
      "Failed to update company settings.",
    );
  }
}

export async function archiveCompany(input: CompanyIdInput): Promise<Company> {
  const values = companyIdSchema.parse(input);
  const company = await getCompanyById(values.companyId, values.workspaceId);

  if (company.status === "archived") {
    return company;
  }

  try {
    return await updateCompanyById(values.companyId, { status: "archived" });
  } catch (error) {
    console.error("archiveCompany failed", error);
    throw new CoreError(
      "COMPANY_ARCHIVE_FAILED",
      "Failed to archive company.",
    );
  }
}

export async function restoreCompany(input: CompanyIdInput): Promise<Company> {
  const values = companyIdSchema.parse(input);
  const company = await getCompanyById(values.companyId, values.workspaceId);

  if (company.status !== "archived") {
    throw new CoreError(
      "COMPANY_NOT_ARCHIVED",
      "Only archived companies can be restored.",
    );
  }

  try {
    return await updateCompanyById(values.companyId, { status: "active" });
  } catch (error) {
    console.error("restoreCompany failed", error);
    throw new CoreError(
      "COMPANY_RESTORE_FAILED",
      "Failed to restore company.",
    );
  }
}

export async function reactivateCompany(input: CompanyIdInput): Promise<Company> {
  const values = companyIdSchema.parse(input);
  const company = await getCompanyById(values.companyId, values.workspaceId);

  if (company.status !== "suspended") {
    throw new CoreError(
      "COMPANY_NOT_SUSPENDED",
      "Only suspended companies can be reactivated.",
    );
  }

  try {
    return await updateCompanyById(values.companyId, { status: "active" });
  } catch (error) {
    console.error("reactivateCompany failed", error);
    throw new CoreError(
      "COMPANY_REACTIVATE_FAILED",
      "Failed to reactivate company.",
    );
  }
}

export async function suspendCompany(input: CompanyIdInput): Promise<Company> {
  const values = companyIdSchema.parse(input);
  const company = await getCompanyById(values.companyId, values.workspaceId);

  if (company.status === "archived") {
    throw new CoreError(
      "COMPANY_NOT_EDITABLE",
      "Archived companies cannot be suspended. Restore first.",
    );
  }
  if (company.status === "suspended") {
    return company;
  }

  try {
    return await updateCompanyById(values.companyId, { status: "suspended" });
  } catch (error) {
    console.error("suspendCompany failed", error);
    throw new CoreError(
      "COMPANY_SUSPEND_FAILED",
      "Failed to suspend company.",
    );
  }
}
