import { headers } from "next/headers";

import { resolveSessionContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listCompaniesForUserInWorkspace } from "@/core/company/active-company";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { WorkspaceAppShell } from "@/components/layout/workspace-app-shell";
import { ClientContextProvider } from "@/features/client/components/client-context-provider";
import { toClientContextValue } from "@/features/client/lib/client-context";
import { CompanyContextProvider } from "@/features/company/components/company-context-provider";
import {
  serializeSessionContext,
  toCompanyContextValue,
} from "@/features/company/lib/company-context";
import { ProjectContextProvider } from "@/features/project/components/project-context-provider";
import { toProjectContextValue } from "@/features/project/lib/project-context";
import { VendorContextProvider } from "@/features/vendor/components/vendor-context-provider";
import { toVendorContextValue } from "@/features/vendor/lib/vendor-context";
import { AuthLoadingGate } from "@/features/auth/components/auth-loading-gate";
import { getSessionUser } from "@/features/auth/lib/get-session-user";
import { redirectToLogin } from "@/lib/auth/redirects";
import { isOsEntryPath } from "@/lib/os/entry-paths";
import { createClient } from "@/lib/supabase/server";

async function resolveUserLabel(email: string | undefined) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return email?.split("@")[0] || "User";
  return (
    (typeof user.user_metadata?.display_name === "string" &&
      user.user_metadata.display_name) ||
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    email?.split("@")[0] ||
    "User"
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    const headerStore = await headers();
    const pathname = headerStore.get("x-pathname") ?? "/dashboard";
    redirectToLogin({ next: pathname, reason: "unauthenticated" });
  }

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "/dashboard";
  const activeWorkspace = await resolveActiveWorkspace(user.id);
  const sessionContext = await resolveSessionContext(user.id);
  const showAppChrome = !isOsEntryPath(pathname) && sessionContext != null;

  if (!showAppChrome) {
    return <AuthLoadingGate>{children}</AuthLoadingGate>;
  }

  const companies = activeWorkspace
    ? await listCompaniesForUserInWorkspace(user.id, activeWorkspace.id)
    : [];

  const [projects, clients, vendors, userLabel] = await Promise.all([
    listProjectsByCompany(
      sessionContext.workspace.id,
      sessionContext.company.id,
    ),
    listClientsByCompany(
      sessionContext.workspace.id,
      sessionContext.company.id,
    ),
    listVendorsByCompany(
      sessionContext.workspace.id,
      sessionContext.company.id,
    ),
    resolveUserLabel(user.email),
  ]);

  const companyContextValue = toCompanyContextValue({
    context: serializeSessionContext(sessionContext),
    companies,
  });

  const projectContextValue = toProjectContextValue({
    workspaceId: sessionContext.workspace.id,
    companyId: sessionContext.company.id,
    projects,
  });

  const clientContextValue = toClientContextValue({
    workspaceId: sessionContext.workspace.id,
    companyId: sessionContext.company.id,
    clients,
  });

  const vendorContextValue = toVendorContextValue({
    workspaceId: sessionContext.workspace.id,
    companyId: sessionContext.company.id,
    vendors,
  });

  return (
    <CompanyContextProvider value={companyContextValue}>
      <ProjectContextProvider value={projectContextValue}>
        <ClientContextProvider value={clientContextValue}>
          <VendorContextProvider value={vendorContextValue}>
            <WorkspaceAppShell
              businessName={sessionContext.company.name}
              workspaceName={sessionContext.workspace.name}
              userLabel={userLabel}
              userEmail={user.email ?? null}
              workspaceId={sessionContext.workspace.id}
              companyId={sessionContext.company.id}
            >
              {children}
            </WorkspaceAppShell>
          </VendorContextProvider>
        </ClientContextProvider>
      </ProjectContextProvider>
    </CompanyContextProvider>
  );
}
