"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { switchActiveCompany } from "@/core/company/active-company";
import { toCoreUserMessage } from "@/core/errors";
import type { SwitchCompanyInput } from "@/core/schemas";
import { switchActiveWorkspace } from "@/core/workspace/active-workspace";

export type ContextActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateContextPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/welcome");
  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard/division");
  revalidatePath("/dashboard/select-workspace");
  revalidatePath("/dashboard/select-company");
}

/** Post-login entry: OS Welcome flow (Project 056). */
export async function enterDashboardAction(
  nextPath = "/dashboard",
): Promise<void> {
  const { enterOsAction } = await import("@/core/actions/os-actions");
  await enterOsAction(nextPath);
}

export async function switchCompanyAction(
  input: SwitchCompanyInput,
): Promise<ContextActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const result = await switchActiveCompany(
      userId,
      input.workspaceId,
      input.companyId,
    );
    revalidateContextPaths();
    return { ok: true, data: { companyId: result.company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to switch company"),
    };
  }
}

export async function selectWorkspaceAndContinueAction(input: {
  workspaceId: string;
}): Promise<ContextActionResult> {
  try {
    const userId = await requireSessionUserId();
    await switchActiveWorkspace(userId, input.workspaceId);
    revalidateContextPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to select workspace"),
    };
  }
}

export async function selectCompanyAndContinueAction(input: {
  workspaceId: string;
  companyId: string;
}): Promise<ContextActionResult> {
  try {
    const userId = await requireSessionUserId();
    await switchActiveCompany(userId, input.workspaceId, input.companyId);
    revalidateContextPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to select company"),
    };
  }
}
