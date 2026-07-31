"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import { requireMembershipPermission } from "@/core/membership/memberships";
import type {
  CreateVendorInput,
  UpdateVendorInput,
  VendorIdInput,
} from "@/core/schemas";
import {
  archiveVendor,
  createVendor,
  deactivateVendor,
  restoreVendor,
  updateVendor,
} from "@/core/vendor/vendor";

export type VendorActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateVendorPaths(vendorId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/vendors");
  if (vendorId) {
    revalidatePath(`/dashboard/vendors/${vendorId}`);
  }
}

async function requireVendorWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "vendor.write",
  );
}

export async function createVendorAction(
  input: CreateVendorInput,
): Promise<VendorActionResult<{ vendorId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireVendorWrite(userId, input.workspaceId, input.companyId);
    const vendor = await createVendor(input, { actorId: userId });
    revalidateVendorPaths(vendor.id);
    return { ok: true, data: { vendorId: vendor.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create vendor"),
    };
  }
}

export async function updateVendorAction(
  input: UpdateVendorInput,
): Promise<VendorActionResult<{ vendorId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireVendorWrite(userId, input.workspaceId, input.companyId);
    const vendor = await updateVendor(input, { actorId: userId });
    revalidateVendorPaths(vendor.id);
    return { ok: true, data: { vendorId: vendor.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update vendor"),
    };
  }
}

export async function archiveVendorAction(
  input: VendorIdInput,
): Promise<VendorActionResult<{ vendorId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireVendorWrite(userId, input.workspaceId, input.companyId);
    const vendor = await archiveVendor(input, { actorId: userId });
    revalidateVendorPaths(vendor.id);
    return { ok: true, data: { vendorId: vendor.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive vendor"),
    };
  }
}

export async function restoreVendorAction(
  input: VendorIdInput,
): Promise<VendorActionResult<{ vendorId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireVendorWrite(userId, input.workspaceId, input.companyId);
    const vendor = await restoreVendor(input, { actorId: userId });
    revalidateVendorPaths(vendor.id);
    return { ok: true, data: { vendorId: vendor.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore vendor"),
    };
  }
}

export async function deactivateVendorAction(
  input: VendorIdInput,
): Promise<VendorActionResult<{ vendorId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireVendorWrite(userId, input.workspaceId, input.companyId);
    const vendor = await deactivateVendor(input, { actorId: userId });
    revalidateVendorPaths(vendor.id);
    return { ok: true, data: { vendorId: vendor.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to deactivate vendor"),
    };
  }
}
