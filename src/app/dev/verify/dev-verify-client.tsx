"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { CommandCenterHome } from "@/components/command-center/command-center-home";
import { ClientList } from "@/components/crm/client-list";
import { WorkspaceAppShell } from "@/components/layout/workspace-app-shell";
import { ProjectList } from "@/components/projects/project-list";
import { CompanyContextProvider } from "@/features/company/components/company-context-provider";
import type { CompanyContextValue } from "@/features/company/lib/company-context";
import { SettingsNav } from "@/features/settings/components/settings-nav";
import { SETTINGS_SECTIONS } from "@/features/settings/lib/settings-sections";
import type { Company, Membership, Workspace } from "@/core/types";
import { uiZh } from "@/config/ui-zh";

/**
 * DEV-ONLY visual verification harness (Projects 068–070).
 * Renders the production shell + Daily Workspace surfaces without auth
 * so screenshots can prove brand background + homepage layout.
 *
 * Not linked from product navigation. Production returns 404 via server page.
 */

const now = "2026-07-28T00:00:00.000Z";

const mockWorkspace: Workspace = {
  id: "ws-verify",
  name: "RIVA Studio",
  slug: "riva-studio",
  status: "active",
  timezone: "Asia/Hong_Kong",
  locale: "zh-CN",
  currency: "HKD",
  country: "HK",
  logo_url: null,
  custom_domain: null,
  owner_id: "user-verify",
  created_at: now,
  updated_at: now,
};

const mockCompany: Company = {
  id: "co-verify",
  workspace_id: mockWorkspace.id,
  name: "北风活动",
  slug: "northwind-events",
  status: "active",
  type: "agency",
  logo_url: null,
  country: "HK",
  timezone: "Asia/Hong_Kong",
  locale: "zh-CN",
  currency: "HKD",
  registration_no: null,
  address: null,
  phone: null,
  email: null,
  website: null,
  bank_name: null,
  bank_account_name: null,
  bank_account_number: null,
  swift_code: null,
  signature_url: null,
  default_payment_terms: null,
  default_terms_and_conditions: null,
  default_document_footer: null,
  created_at: now,
  updated_at: now,
};

const mockMembership: Membership = {
  id: "mem-verify",
  user_id: "user-verify",
  workspace_id: mockWorkspace.id,
  company_id: mockCompany.id,
  role_key: "owner",
  email: "ravius@example.com",
  full_name: "Ravius",
  status: "accepted",
  person_id: null,
  created_at: now,
  updated_at: now,
};

const companyContextValue: CompanyContextValue = {
  workspaceId: mockWorkspace.id,
  workspace: mockWorkspace,
  company: mockCompany,
  membership: mockMembership,
  permissions: ["client.read", "client.write", "project.read", "project.write"],
  companies: [mockCompany],
};

const VIEWS = ["dashboard", "settings", "crm", "projects"] as const;
type VerifyView = (typeof VIEWS)[number];

function isVerifyView(value: string): value is VerifyView {
  return (VIEWS as readonly string[]).includes(value);
}

function DashboardView() {
  return (
    <CommandCenterHome
      displayName="Ravius"
      focus={{
        tasks: [
          {
            id: "t1",
            title: "向 Carmen 发送合同",
            meta: uiZh.dueToday,
            href: "#",
          },
        ],
        meetings: [
          {
            id: "m1",
            title: "场地勘察",
            meta: "下午 3:00",
            href: "#",
          },
        ],
        deadlines: [],
      }}
      activity={[
        {
          id: "a1",
          title: "任务已完成：确认花艺",
          meta: "7月28日 下午2:14",
        },
      ]}
      briefMessage={uiZh.noMeetingsAfternoon}
    />
  );
}

function SettingsView() {
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside>
        <SettingsNav />
      </aside>
      <div className="min-w-0 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/35">
            {uiZh.platformSettings}
          </p>
          <h1 className="mt-2 text-xl text-white">{uiZh.settings}</h1>
          <p className="mt-2 text-sm text-white/45">
            {uiZh.modularSettingsFor("Ravius")}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SETTINGS_SECTIONS.map((section) => (
            <Link
              key={section.id}
              href={section.href}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
            >
              <p className="text-sm font-medium text-white">{section.label}</p>
              <p className="mt-1 text-xs text-white/45">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CrmView() {
  return (
    <ClientList
      workspaceId={mockWorkspace.id}
      companyId={mockCompany.id}
      businessName={mockCompany.name}
      rows={[]}
      canWrite
    />
  );
}

function ProjectsView() {
  return (
    <ProjectList
      workspaceId={mockWorkspace.id}
      companyId={mockCompany.id}
      businessName={mockCompany.name}
      rows={[]}
      clients={[]}
      canWrite
    />
  );
}

export function DevVerifyClient() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") ?? "dashboard";
  const view: VerifyView = isVerifyView(viewParam) ? viewParam : "dashboard";

  return (
    <CompanyContextProvider value={companyContextValue}>
      <WorkspaceAppShell
        businessName={mockCompany.name}
        workspaceName={mockWorkspace.name}
        userLabel="Ravius"
        userEmail="ravius@example.com"
        workspaceId={mockWorkspace.id}
        companyId={mockCompany.id}
      >
        {view === "dashboard" ? <DashboardView /> : null}
        {view === "settings" ? <SettingsView /> : null}
        {view === "crm" ? <CrmView /> : null}
        {view === "projects" ? <ProjectsView /> : null}
      </WorkspaceAppShell>
    </CompanyContextProvider>
  );
}
