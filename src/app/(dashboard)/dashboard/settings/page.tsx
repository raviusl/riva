import Link from "next/link";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import { loadSettingsPageContext } from "@/features/settings/lib/load-settings-page-context";
import { SETTINGS_SECTIONS } from "@/features/settings/lib/settings-sections";

export default async function SettingsHubPage() {
  const { isSuperAdmin, profile, context } = await loadSettingsPageContext();

  return (
    <WorkspaceLayout
      backHref="/dashboard"
      backLabel={uiZh.backToDashboard}
      fallbackLabel={uiZh.loadingSettings}
    >
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <SettingsNav />
        </aside>

        <div className="min-w-0 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">
              {uiZh.platformSettings}
            </p>
            <h1 className="mt-2 text-xl text-white">{uiZh.settings}</h1>
            <p className="mt-2 text-sm text-white/45">
              {uiZh.modularSettingsFor(profile.displayName)}
              {context.companyName ? (
                <>
                  {" "}
                  ·{" "}
                  <span className="text-white/70">{context.companyName}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {SETTINGS_SECTIONS.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    {section.label}
                  </p>
                  {section.placeholder ? (
                    <span className="text-[10px] text-white/30">
                      {uiZh.soon}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-white/45">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>

          <div className="space-y-3 border-t border-white/[0.06] pt-6">
            <p className="text-xs text-white/35">{uiZh.related}</p>
            <Link
              href="/dashboard/workspaces"
              className="block rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {uiZh.manageWorkspacesLink}
            </Link>
            <Link
              href="/dashboard/companies"
              className="block rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              {uiZh.manageCompaniesLink}
            </Link>
            {isSuperAdmin ? (
              <Link
                href="/dashboard/settings/users"
                className="block rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {uiZh.userManagement}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
