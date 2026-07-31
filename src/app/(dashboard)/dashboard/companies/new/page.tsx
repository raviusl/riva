import Link from "next/link";
import { redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireSessionUserId } from "@/core/auth/session";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { CreateCompanyForm } from "@/features/company/components/create-company-form";

export default async function NewCompanyPage() {
  const userId = await requireSessionUserId();
  const workspace = await resolveActiveWorkspace(userId);

  if (!workspace) {
    redirect("/dashboard/workspaces/new");
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/companies"
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.companies)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.createCompany}</h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.addCompanyTo(workspace.name)}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateCompanyForm workspaceId={workspace.id} />
      </div>
    </div>
  );
}
