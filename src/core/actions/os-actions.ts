"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSessionUserId } from "@/core/auth/session";
import { switchActiveCompany } from "@/core/company/active-company";
import { toCoreUserMessage } from "@/core/errors";
import { listDivisionsForBusiness } from "@/core/os/business";
import { switchActiveWorkspace } from "@/core/workspace/active-workspace";
import { safeAuthNextPath } from "@/features/auth/lib/auth-ui";
import {
  OS_BUSINESS_PATH,
  OS_DIVISION_PATH,
  OS_WELCOME_PATH,
} from "@/lib/os/entry-paths";

export type OsActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateOsPaths() {
  revalidatePath("/dashboard");
  revalidatePath(OS_WELCOME_PATH);
  revalidatePath(OS_BUSINESS_PATH);
  revalidatePath(OS_DIVISION_PATH);
  revalidatePath("/dashboard/select-workspace");
  revalidatePath("/dashboard/select-company");
}

/**
 * Post-login OS entry: Welcome → Business → Division (if any) → Workspace.
 * Deep links with complete context skip Welcome.
 */
export async function enterOsAction(nextPath = "/dashboard"): Promise<void> {
  const userId = await requireSessionUserId();
  const destination = safeAuthNextPath(nextPath, "/dashboard");

  const { resolveContextStep } = await import("@/core/auth/context");
  const step = await resolveContextStep(userId);

  const isDeepLink =
    destination !== "/dashboard" && destination.startsWith("/dashboard/");

  if (isDeepLink && step.step === "ready") {
    redirect(destination);
  }

  if (step.step === "workspace" && step.workspaces.length === 0) {
    redirect("/dashboard/workspaces/new");
  }

  redirect(OS_WELCOME_PATH);
}

export async function selectBusinessAction(input: {
  workspaceId: string;
  companyId: string;
}): Promise<OsActionResult<{ nextPath: string }>> {
  try {
    const userId = await requireSessionUserId();
    await switchActiveWorkspace(userId, input.workspaceId);
    await switchActiveCompany(userId, input.workspaceId, input.companyId);
    revalidateOsPaths();

    const divisions = await listDivisionsForBusiness(
      input.workspaceId,
      input.companyId,
    );
    // Skip Division Picker when none or only one division exists.
    const nextPath =
      divisions.length > 1 ? OS_DIVISION_PATH : "/dashboard";

    return { ok: true, data: { nextPath } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to select business"),
    };
  }
}

export async function continueFromDivisionAction(): Promise<
  OsActionResult<{ nextPath: string }>
> {
  try {
    await requireSessionUserId();
    revalidateOsPaths();
    return { ok: true, data: { nextPath: "/dashboard" } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to continue"),
    };
  }
}
