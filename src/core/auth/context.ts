import "server-only";

import { redirect } from "next/navigation";

import { resolveActiveCompany } from "@/core/company/active-company";
import { CoreError } from "@/core/errors";
import {
  getPermissionsForMembership,
  listMembershipsForUser,
} from "@/core/membership/memberships";
import type { SessionContext } from "@/core/types";
import {
  listWorkspacesForUser,
  resolveActiveWorkspace,
} from "@/core/workspace/active-workspace";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createClient } from "@/lib/supabase/server";

export type ContextResolution =
  | { step: "workspace"; workspaces: Awaited<ReturnType<typeof listWorkspacesForUser>> }
  | {
      step: "company";
      workspace: Awaited<ReturnType<typeof getWorkspaceById>>;
      companies: Awaited<ReturnType<typeof import("@/core/company/active-company").listCompaniesForUserInWorkspace>>;
    }
  | { step: "ready"; context: SessionContext };

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new CoreError("UNAUTHENTICATED", "You must be signed in.");
  }
  return userId;
}

/**
 * Full session context: User → Workspace → Company → Role
 */
export async function resolveSessionContext(
  userId: string,
): Promise<SessionContext | null> {
  const workspace = await resolveActiveWorkspace(userId);
  if (!workspace) {
    return null;
  }

  const companyContext = await resolveActiveCompany(userId, workspace);
  if (!companyContext) {
    return null;
  }

  const permissions = await getPermissionsForMembership(
    companyContext.membership,
  );

  return {
    userId,
    workspace,
    company: companyContext.company,
    membership: companyContext.membership,
    permissions,
  };
}

export async function requireSessionContext(): Promise<SessionContext> {
  const userId = await requireSessionUserId();
  const context = await resolveSessionContext(userId);
  if (!context) {
    throw new CoreError(
      "CONTEXT_INCOMPLETE",
      "Workspace and company context is required.",
    );
  }
  return context;
}

/** Determines onboarding step after login. */
export async function resolveContextStep(
  userId: string,
): Promise<ContextResolution> {
  const workspaces = await listWorkspacesForUser(userId);
  if (workspaces.length === 0) {
    return { step: "workspace", workspaces: [] };
  }

  const workspace = await resolveActiveWorkspace(userId);
  if (!workspace) {
    return { step: "workspace", workspaces };
  }

  const memberships = await listMembershipsForUser(userId);
  const inWorkspace = memberships.filter(
    (row) => row.workspace_id === workspace.id,
  );
  if (inWorkspace.length === 0) {
    return { step: "workspace", workspaces };
  }

  const companyContext = await resolveActiveCompany(userId, workspace);
  if (!companyContext) {
    const { listCompaniesForUserInWorkspace } = await import(
      "@/core/company/active-company"
    );
    const companies = await listCompaniesForUserInWorkspace(
      userId,
      workspace.id,
    );
    return { step: "company", workspace, companies };
  }

  const context = await resolveSessionContext(userId);
  if (!context) {
    redirect("/dashboard/enter");
  }

  return { step: "ready", context };
}

/** Gate dashboard routes: Business context required before Workspace modules. */
export async function requireDashboardContext(): Promise<SessionContext> {
  const userId = await requireSessionUserId();
  const step = await resolveContextStep(userId);

  if (step.step === "workspace") {
    redirect(
      step.workspaces.length === 0
        ? "/dashboard/workspaces/new"
        : "/dashboard/business",
    );
  }
  if (step.step === "company") {
    redirect("/dashboard/business");
  }

  return step.context;
}
