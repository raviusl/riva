import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  createWeddingPackageSchema,
  updateWeddingPackageSchema,
  weddingPackageIdSchema,
  type CreateWeddingPackageInput,
  type UpdateWeddingPackageInput,
  type WeddingPackageIdInput,
} from "@/core/wedding-package/schema";
import {
  deleteWeddingPackageById,
  findWeddingPackageById,
  findWeddingPackagesByProject,
  insertWeddingPackage,
  replaceWeddingPackageItems,
  updateWeddingPackageById,
} from "@/core/wedding-package/repository";
import type { WeddingProjectPackageWithItems } from "@/core/wedding-package/types";
import { getWorkspaceById } from "@/core/workspace/workspace";

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function assertScope(
  workspaceId: string,
  companyId: string,
  projectId: string,
) {
  await getWorkspaceById(workspaceId);
  const company = await getCompanyById(companyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
  return project;
}

function mapItemRows(
  values: CreateWeddingPackageInput,
  packageId: string,
) {
  return (values.items ?? []).map((item, index) => ({
    package_id: packageId,
    workspace_id: values.workspaceId,
    company_id: values.companyId,
    project_id: values.projectId,
    position: item.position ?? index,
    title: item.title.trim(),
    description: trimOrNull(item.description),
    quantity: item.quantity,
    unit_price: item.unitPrice,
    unit_of_measure: trimOrNull(item.unitOfMeasure),
    category: trimOrNull(item.category),
    vendor_id: item.vendorId ?? null,
    is_included: item.isIncluded ?? true,
  }));
}

export async function listWeddingPackages(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<WeddingProjectPackageWithItems[]> {
  await assertScope(input.workspaceId, input.companyId, input.projectId);
  try {
    return await findWeddingPackagesByProject(
      input.workspaceId,
      input.companyId,
      input.projectId,
      { includeArchived: input.includeArchived },
    );
  } catch (error) {
    console.error("listWeddingPackages failed", error);
    throw new CoreError(
      "WEDDING_PACKAGE_LIST_FAILED",
      "Failed to load wedding packages.",
    );
  }
}

export async function createWeddingPackage(
  input: CreateWeddingPackageInput,
  actorId?: string,
): Promise<WeddingProjectPackageWithItems> {
  const values = createWeddingPackageSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);

  const existing = await findWeddingPackagesByProject(
    values.workspaceId,
    values.companyId,
    values.projectId,
    { includeArchived: true },
  );
  const nextSequence =
    values.sequence ??
    (existing.length === 0
      ? 0
      : Math.max(...existing.map((row) => row.sequence)) + 1);

  try {
    const created = await insertWeddingPackage({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      project_id: values.projectId,
      source_finance_package_id: values.sourceFinancePackageId ?? null,
      name: values.name.trim(),
      description: trimOrNull(values.description),
      currency: values.currency ?? "MYR",
      status: values.status ?? "draft",
      sequence: nextSequence,
      notes: trimOrNull(values.notes),
      created_by: actorId ?? null,
    });
    const items = await replaceWeddingPackageItems(
      created.id,
      mapItemRows(values, created.id),
    );
    return { ...created, items };
  } catch (error) {
    console.error("createWeddingPackage failed", error);
    throw new CoreError(
      "WEDDING_PACKAGE_CREATE_FAILED",
      "Failed to create wedding package.",
    );
  }
}

export async function updateWeddingPackage(
  input: UpdateWeddingPackageInput,
  actorId?: string,
): Promise<WeddingProjectPackageWithItems> {
  const values = updateWeddingPackageSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingPackageById(
    values.packageId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_PACKAGE_NOT_FOUND", "Package not found.");
  }

  try {
    const updated = await updateWeddingPackageById(before.id, {
      name: values.name.trim(),
      description: trimOrNull(values.description),
      currency: values.currency ?? before.currency,
      status: values.status ?? before.status,
      notes: trimOrNull(values.notes),
      source_finance_package_id:
        values.sourceFinancePackageId !== undefined
          ? values.sourceFinancePackageId
          : before.source_finance_package_id,
      updated_by: actorId ?? null,
    });
    const items = await replaceWeddingPackageItems(
      updated.id,
      mapItemRows(values, updated.id),
    );
    return { ...updated, items };
  } catch (error) {
    console.error("updateWeddingPackage failed", error);
    throw new CoreError(
      "WEDDING_PACKAGE_UPDATE_FAILED",
      "Failed to update wedding package.",
    );
  }
}

export async function archiveWeddingPackage(
  input: WeddingPackageIdInput,
  actorId?: string,
): Promise<WeddingProjectPackageWithItems> {
  const values = weddingPackageIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingPackageById(
    values.packageId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_PACKAGE_NOT_FOUND", "Package not found.");
  }
  if (before.archived_at) return before;
  const updated = await updateWeddingPackageById(before.id, {
    archived_at: new Date().toISOString(),
    status: "archived",
    updated_by: actorId ?? null,
  });
  return { ...updated, items: before.items };
}

export async function restoreWeddingPackage(
  input: WeddingPackageIdInput,
  actorId?: string,
): Promise<WeddingProjectPackageWithItems> {
  const values = weddingPackageIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingPackageById(
    values.packageId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_PACKAGE_NOT_FOUND", "Package not found.");
  }
  const updated = await updateWeddingPackageById(before.id, {
    archived_at: null,
    status: before.status === "archived" ? "draft" : before.status,
    updated_by: actorId ?? null,
  });
  return { ...updated, items: before.items };
}

export async function deleteWeddingPackage(
  input: WeddingPackageIdInput,
): Promise<void> {
  const values = weddingPackageIdSchema.parse(input);
  await assertScope(values.workspaceId, values.companyId, values.projectId);
  const before = await findWeddingPackageById(
    values.packageId,
    values.workspaceId,
  );
  if (!before || before.project_id !== values.projectId) {
    throw new CoreError("WEDDING_PACKAGE_NOT_FOUND", "Package not found.");
  }
  await deleteWeddingPackageById(before.id);
}

export async function duplicateWeddingPackage(
  input: WeddingPackageIdInput,
  actorId?: string,
): Promise<WeddingProjectPackageWithItems> {
  const values = weddingPackageIdSchema.parse(input);
  const source = await findWeddingPackageById(
    values.packageId,
    values.workspaceId,
  );
  if (!source || source.project_id !== values.projectId) {
    throw new CoreError("WEDDING_PACKAGE_NOT_FOUND", "Package not found.");
  }

  return createWeddingPackage(
    {
      workspaceId: values.workspaceId,
      companyId: values.companyId,
      projectId: values.projectId,
      name: `${source.name} (copy)`,
      description: source.description,
      currency: source.currency as CreateWeddingPackageInput["currency"],
      status: "draft",
      notes: source.notes,
      sourceFinancePackageId: source.source_finance_package_id,
      items: source.items.map((item) => ({
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        unitOfMeasure: item.unit_of_measure,
        category: item.category,
        vendorId: item.vendor_id,
        isIncluded: item.is_included,
        position: item.position,
      })),
      sequence: source.sequence + 1,
    },
    actorId,
  );
}
