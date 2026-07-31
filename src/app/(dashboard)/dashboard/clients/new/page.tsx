import Link from "next/link";
import { redirect } from "next/navigation";

import { ClientForm } from "@/components/crm/client-form";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";

/**
 * Legacy full-page create route — kept for deep links / Quick Actions.
 * Prefer the Create Client modal on the CRM list.
 */
export default async function NewClientPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.write")) {
    redirect("/dashboard/clients");
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.clients)}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          {uiZh.createClient}
        </h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.addClientTo(context.company.name)}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <ClientForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
        />
      </div>
    </div>
  );
}
