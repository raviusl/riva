import "server-only";

import { getCompanyById } from "@/core/company/company";
import {
  assertCompanyBoundary,
  requireCompany,
} from "@/core/company-isolation";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  createVendorSchema,
  updateVendorSchema,
  vendorIdSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
  type VendorIdInput,
} from "@/core/schemas";
import type { Vendor, VendorStatus } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { recordVendorAudit } from "@/core/vendor/audit";
import {
  findVendorById,
  findVendorsByCompany,
  findVendorsByProject,
  insertVendor,
  updateVendorById,
} from "@/core/vendor/repository";

export type { CreateVendorInput, UpdateVendorInput, VendorIdInput };

const EDITABLE_STATUSES: VendorStatus[] = ["active", "inactive"];

function assertEditable(vendor: Vendor): void {
  if (!EDITABLE_STATUSES.includes(vendor.status)) {
    throw new CoreError(
      "VENDOR_NOT_EDITABLE",
      "Archived vendors cannot be edited. Restore the vendor first.",
    );
  }
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<string> {
  const scopedCompanyId = requireCompany(companyId);
  const company = await getCompanyById(scopedCompanyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  return scopedCompanyId;
}

async function assertProjectInCompany(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId || project.workspace_id !== workspaceId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
}

function assertVendorCompanyScope(vendor: Vendor, companyId: string): void {
  assertCompanyBoundary(companyId, vendor.company_id);
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export type VendorMutationContext = {
  actorId: string;
};

export async function createVendor(
  input: CreateVendorInput,
  context?: VendorMutationContext,
): Promise<Vendor> {
  const values = createVendorSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  const companyId = await assertCompanyInWorkspace(
    values.workspaceId,
    values.companyId,
  );

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      companyId,
      values.projectId,
    );
  }

  try {
    const vendor = await insertVendor({
      workspace_id: values.workspaceId,
      company_id: companyId,
      project_id: values.projectId ?? null,
      owner_id: values.ownerId ?? null,
      name: values.name.trim(),
      company_name: emptyToNull(values.companyName),
      contact_person: emptyToNull(values.contactPerson),
      email: values.email?.trim().toLowerCase() || null,
      phone: emptyToNull(values.phone),
      website: emptyToNull(values.website),
      address: emptyToNull(values.address),
      category: values.category ?? null,
      status: values.status ?? "active",
      notes: emptyToNull(values.notes),
    });

    if (context?.actorId) {
      recordVendorAudit({
        action: "create",
        actorId: context.actorId,
        before: null,
        after: vendor,
      });
    }

    return vendor;
  } catch (error) {
    console.error("createVendor failed", error);
    throw new CoreError("VENDOR_CREATE_FAILED", "Failed to create vendor.");
  }
}

export async function getVendorById(
  vendorId: string,
  workspaceId?: string,
  companyId?: string,
): Promise<Vendor> {
  try {
    const vendor = await findVendorById(vendorId, workspaceId);
    if (!vendor) {
      throw new CoreError("VENDOR_NOT_FOUND", "Vendor not found.");
    }
    if (companyId) {
      assertVendorCompanyScope(vendor, companyId);
    }
    return vendor;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getVendorById failed", error);
    throw new CoreError("VENDOR_LOAD_FAILED", "Failed to load vendor.");
  }
}

export async function listVendorsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Vendor[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );

  try {
    return await findVendorsByCompany(workspaceId, scopedCompanyId);
  } catch (error) {
    console.error("listVendorsByCompany failed", error);
    throw new CoreError("VENDOR_LIST_FAILED", "Failed to list vendors.");
  }
}

export async function listVendorsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Vendor[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );
  await assertProjectInCompany(workspaceId, scopedCompanyId, projectId);

  try {
    return await findVendorsByProject(workspaceId, scopedCompanyId, projectId);
  } catch (error) {
    console.error("listVendorsByProject failed", error);
    throw new CoreError("VENDOR_LIST_FAILED", "Failed to list vendors.");
  }
}

export async function updateVendor(
  input: UpdateVendorInput,
  context?: VendorMutationContext,
): Promise<Vendor> {
  const values = updateVendorSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getVendorById(
    values.vendorId,
    values.workspaceId,
    companyId,
  );

  assertEditable(before);

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      companyId,
      values.projectId,
    );
  }

  try {
    const vendor = await updateVendorById(before.id, {
      name: values.name.trim(),
      company_name:
        values.companyName !== undefined
          ? emptyToNull(values.companyName)
          : before.company_name,
      contact_person:
        values.contactPerson !== undefined
          ? emptyToNull(values.contactPerson)
          : before.contact_person,
      email: values.email?.trim().toLowerCase() || null,
      phone: emptyToNull(values.phone),
      website:
        values.website !== undefined
          ? emptyToNull(values.website)
          : before.website,
      address:
        values.address !== undefined
          ? emptyToNull(values.address)
          : before.address,
      category: values.category ?? null,
      project_id:
        values.projectId !== undefined ? values.projectId : before.project_id,
      owner_id: values.ownerId !== undefined ? values.ownerId : before.owner_id,
      status: values.status ?? before.status,
      notes:
        values.notes !== undefined ? emptyToNull(values.notes) : before.notes,
    });

    if (context?.actorId) {
      recordVendorAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: vendor,
      });
    }

    return vendor;
  } catch (error) {
    console.error("updateVendor failed", error);
    throw new CoreError("VENDOR_UPDATE_FAILED", "Failed to update vendor.");
  }
}

export async function archiveVendor(
  input: VendorIdInput,
  context?: VendorMutationContext,
): Promise<Vendor> {
  const values = vendorIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getVendorById(
    values.vendorId,
    values.workspaceId,
    companyId,
  );

  if (before.status === "archived") {
    return before;
  }

  try {
    const vendor = await updateVendorById(before.id, { status: "archived" });
    if (context?.actorId) {
      recordVendorAudit({
        action: "archive",
        actorId: context.actorId,
        before,
        after: vendor,
      });
    }
    return vendor;
  } catch (error) {
    console.error("archiveVendor failed", error);
    throw new CoreError("VENDOR_ARCHIVE_FAILED", "Failed to archive vendor.");
  }
}

export async function restoreVendor(
  input: VendorIdInput,
  context?: VendorMutationContext,
): Promise<Vendor> {
  const values = vendorIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getVendorById(
    values.vendorId,
    values.workspaceId,
    companyId,
  );

  if (before.status !== "archived") {
    throw new CoreError(
      "VENDOR_NOT_ARCHIVED",
      "Only archived vendors can be restored.",
    );
  }

  try {
    const vendor = await updateVendorById(before.id, { status: "active" });
    if (context?.actorId) {
      recordVendorAudit({
        action: "restore",
        actorId: context.actorId,
        before,
        after: vendor,
      });
    }
    return vendor;
  } catch (error) {
    console.error("restoreVendor failed", error);
    throw new CoreError("VENDOR_RESTORE_FAILED", "Failed to restore vendor.");
  }
}

export async function deactivateVendor(
  input: VendorIdInput,
  context?: VendorMutationContext,
): Promise<Vendor> {
  const values = vendorIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getVendorById(
    values.vendorId,
    values.workspaceId,
    companyId,
  );

  if (before.status === "archived") {
    throw new CoreError(
      "VENDOR_NOT_EDITABLE",
      "Archived vendors cannot be deactivated. Restore first.",
    );
  }
  if (before.status === "inactive") {
    return before;
  }

  try {
    const vendor = await updateVendorById(before.id, { status: "inactive" });
    if (context?.actorId) {
      recordVendorAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: vendor,
        metadata: { reason: "deactivate" },
      });
    }
    return vendor;
  } catch (error) {
    console.error("deactivateVendor failed", error);
    throw new CoreError(
      "VENDOR_DEACTIVATE_FAILED",
      "Failed to deactivate vendor.",
    );
  }
}
