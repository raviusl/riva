import { WorkspaceSidebar } from "@/components/sidebar/workspace-sidebar";
import { UniversalSearchDialog } from "@/components/search/universal-search-dialog";
import { UniversalSearchProvider } from "@/components/search/universal-search-provider";
import { WorkspaceTopbar } from "@/components/topbar/workspace-topbar";
import { AuthLoadingGate } from "@/features/auth/components/auth-loading-gate";
import { NotificationCenterProvider } from "@/features/notification-center";

type WorkspaceAppShellProps = {
  children: React.ReactNode;
  businessName: string;
  workspaceName: string;
  userLabel: string;
  userEmail?: string | null;
  workspaceId: string;
  companyId: string;
  /** Reserved for future Command Center / AI dock. Hidden in v1. */
  showUtilityPanel?: boolean;
};

/**
 * Production Workspace shell: Sidebar | Main | (reserved Right Panel).
 * Brand atmosphere comes from root `RivaBackground`.
 */
export function WorkspaceAppShell({
  children,
  businessName,
  workspaceName,
  userLabel,
  userEmail = null,
  workspaceId,
  companyId,
  showUtilityPanel = false,
}: WorkspaceAppShellProps) {
  return (
    <UniversalSearchProvider>
      <NotificationCenterProvider
        workspaceId={workspaceId}
        companyId={companyId}
      >
        <div className="relative flex min-h-svh text-white">
          <div className="hidden lg:block">
            <WorkspaceSidebar businessName={businessName} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <WorkspaceTopbar
              workspaceName={workspaceName}
              businessName={businessName}
              userLabel={userLabel}
              userEmail={userEmail}
            />

            <div className="flex min-h-0 flex-1">
              <main className="riva-page min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                <AuthLoadingGate>{children}</AuthLoadingGate>
              </main>

              <aside
                data-workspace-utility-panel
                aria-hidden={showUtilityPanel ? undefined : true}
                className={
                  showUtilityPanel
                    ? "riva-glass hidden w-[320px] shrink-0 border-l border-white/[0.06] xl:block"
                    : "hidden w-0 shrink-0 overflow-hidden border-l border-transparent"
                }
              />
            </div>
          </div>
        </div>
        <UniversalSearchDialog
          workspaceId={workspaceId}
          companyId={companyId}
        />
      </NotificationCenterProvider>
    </UniversalSearchProvider>
  );
}
