"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import {
  archiveWeddingPackage,
  createWeddingPackage,
  deleteWeddingPackage,
  duplicateWeddingPackage,
  listWeddingPackages,
  restoreWeddingPackage,
  updateWeddingPackage,
} from "@/core/wedding-package/service";
import type {
  CreateWeddingPackageInput,
  UpdateWeddingPackageInput,
  WeddingPackageIdInput,
} from "@/core/wedding-package/schema";
import type { WeddingProjectPackageWithItems } from "@/core/wedding-package/types";

export type WeddingPackageActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidatePackages(projectId: string) {
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/projects/${projectId}`, "page");
}

async function requirePackageWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "project.write",
  );
}

export async function loadWeddingPackagesAction(input: {
  workspaceId: string;
  companyId: string;
  projectId: string;
  includeArchived?: boolean;
}): Promise<
  WeddingPackageActionResult<{ packages: WeddingProjectPackageWithItems[] }>
> {
  try {
    const userId = await requireSessionUserId();
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "project.read",
    );
    const packages = await listWeddingPackages(input);
    return { ok: true, data: { packages } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load packages"),
    };
  }
}

export async function createWeddingPackageAction(
  input: CreateWeddingPackageInput,
): Promise<
  WeddingPackageActionResult<{ package: WeddingProjectPackageWithItems }>
> {
  try {
    const userId = await requireSessionUserId();
    await requirePackageWrite(userId, input.workspaceId, input.companyId);
    const pkg = await createWeddingPackage(input, userId);
    revalidatePackages(input.projectId);
    return { ok: true, data: { package: pkg } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create package"),
    };
  }
}

export async function updateWeddingPackageAction(
  input: UpdateWeddingPackageInput,
): Promise<
  WeddingPackageActionResult<{ package: WeddingProjectPackageWithItems }>
> {
  try {
    const userId = await requireSessionUserId();
    await requirePackageWrite(userId, input.workspaceId, input.companyId);
    const pkg = await updateWeddingPackage(input, userId);
    revalidatePackages(input.projectId);
    return { ok: true, data: { package: pkg } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update package"),
    };
  }
}

export async function duplicateWeddingPackageAction(
  input: WeddingPackageIdInput,
): Promise<
  WeddingPackageActionResult<{ package: WeddingProjectPackageWithItems }>
> {
  try {
    const userId = await requireSessionUserId();
    await requirePackageWrite(userId, input.workspaceId, input.companyId);
    const pkg = await duplicateWeddingPackage(input, userId);
    revalidatePackages(input.projectId);
    return { ok: true, data: { package: pkg } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to duplicate package"),
    };
  }
}

export async function archiveWeddingPackageAction(
  input: WeddingPackageIdInput,
): Promise<
  WeddingPackageActionResult<{ package: WeddingProjectPackageWithItems }>
> {
  try {
    const userId = await requireSessionUserId();
    await requirePackageWrite(userId, input.workspaceId, input.companyId);
    const pkg = await archiveWeddingPackage(input, userId);
    revalidatePackages(input.projectId);
    return { ok: true, data: { package: pkg } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive package"),
    };
  }
}

export async function restoreWeddingPackageAction(
  input: WeddingPackageIdInput,
): Promise<
  WeddingPackageActionResult<{ package: WeddingProjectPackageWithItems }>
> {
  try {
    const userId = await requireSessionUserId();
    await requirePackageWrite(userId, input.workspaceId, input.companyId);
    const pkg = await restoreWeddingPackage(input, userId);
    revalidatePackages(input.projectId);
    return { ok: true, data: { package: pkg } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore package"),
    };
  }
}

export async function deleteWeddingPackageAction(
  input: WeddingPackageIdInput,
): Promise<WeddingPackageActionResult> {
  try {
    const userId = await requireSessionUserId();
    await requirePackageWrite(userId, input.workspaceId, input.companyId);
    await deleteWeddingPackage(input);
    revalidatePackages(input.projectId);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to delete package"),
    };
  }
}
