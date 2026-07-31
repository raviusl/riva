import "server-only";

import { resolveSessionContext } from "@/core/auth/context";
import { getPermissionsForPerson } from "@/core/permissions/rbac";
import { getPersonByUserAndWorkspace } from "@/core/people/people";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { uiZh } from "@/config/ui-zh";
import { getSessionUser } from "@/features/auth/lib/get-session-user";
import { getSessionIsSuperAdmin } from "@/features/auth/lib/require-super-admin-page";
import { redirectToLogin } from "@/lib/auth/redirects";
import type {
  SettingsContextPreview,
  SettingsProfilePreview,
} from "@/features/settings/lib/settings-types";

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}) {
  const meta = user.user_metadata ?? {};
  if (typeof meta.display_name === "string" && meta.display_name.trim()) {
    return meta.display_name.trim();
  }
  if (typeof meta.full_name === "string" && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  return user.email?.split("@")[0] || uiZh.userFallback;
}

/**
 * Shared loader for Settings pages — reuses auth + session context.
 */
export async function loadSettingsPageContext() {
  const user = await getSessionUser();
  if (!user) {
    redirectToLogin({ next: "/dashboard/settings", reason: "unauthenticated" });
  }

  const [sessionContext, activeWorkspace, isSuperAdmin] = await Promise.all([
    resolveSessionContext(user.id),
    resolveActiveWorkspace(user.id),
    getSessionIsSuperAdmin(),
  ]);

  let canWriteWorkspace = false;
  if (activeWorkspace) {
    const person = await getPersonByUserAndWorkspace(
      user.id,
      activeWorkspace.id,
    );
    if (person) {
      const permissions = await getPermissionsForPerson(person.id);
      canWriteWorkspace = permissions.has("workspace.write");
    }
  }

  const profile: SettingsProfilePreview = {
    userId: user.id,
    email: user.email ?? null,
    displayName: displayNameFromUser(user),
    roleKey: sessionContext?.membership.role_key ?? null,
    workspaceName:
      sessionContext?.workspace.name ?? activeWorkspace?.name ?? null,
    companyName: sessionContext?.company.name ?? null,
  };

  const context: SettingsContextPreview = {
    workspaceId:
      sessionContext?.workspace.id ?? activeWorkspace?.id ?? null,
    workspaceName:
      sessionContext?.workspace.name ?? activeWorkspace?.name ?? null,
    companyId: sessionContext?.company.id ?? null,
    companyName: sessionContext?.company.name ?? null,
    roleKey: sessionContext?.membership.role_key ?? null,
    canWriteCompany: sessionContext?.permissions.has("company.write") ?? false,
    canWriteWorkspace,
  };

  return {
    user,
    sessionContext,
    activeWorkspace,
    profile,
    context,
    isSuperAdmin,
  };
}
