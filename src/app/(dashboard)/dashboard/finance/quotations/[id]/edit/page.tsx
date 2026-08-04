import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listFinancePackages } from "@/core/finance/packages";
import { getQuotation } from "@/core/finance/quotation";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { QuotationEditor } from "@/features/finance/components/quotations/quotation-editor";
import { createAdminClient } from "@/lib/supabase/admin";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditQuotationPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("finance.write")) {
    redirect(`/dashboard/finance/quotations/${id}`);
  }

  let quotation;
  try {
    quotation = await getQuotation({
      quotationId: id,
      workspaceId: context.workspace.id,
      companyId: context.company.id,
    });
  } catch {
    notFound();
  }

  if (quotation.status !== "draft") {
    redirect(`/dashboard/finance/quotations/${id}`);
  }

  const admin = createAdminClient();
  const [{ data: profile }, projects, clients, vendors, packages] =
    await Promise.all([
      admin
        .from("profiles")
        .select("full_name, display_name")
        .eq("id", context.userId)
        .maybeSingle(),
      listProjectsByCompany(context.workspace.id, context.company.id),
      listClientsByCompany(context.workspace.id, context.company.id),
      listVendorsByCompany(context.workspace.id, context.company.id),
      listFinancePackages({
        workspaceId: context.workspace.id,
        companyId: context.company.id,
      }).catch(() => []),
    ]);

  const preparedByName =
    quotation.documentContent?.preparedBy?.trim() ||
    profile?.display_name?.trim() ||
    profile?.full_name?.trim() ||
    "";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <Link
          href={`/dashboard/finance/quotations/${id}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToQuotations}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.editQuotation}</h1>
        <p className="mt-2 text-sm text-white/45">
          {quotation.referenceNumber ?? uiZh.quotationFallback}
        </p>
      </div>

      <QuotationEditor
        mode="edit"
        workspaceId={context.workspace.id}
        company={context.company}
        projects={projects}
        clients={clients}
        vendors={vendors}
        packages={packages}
        preparedByName={preparedByName}
        quotation={quotation}
      />
    </div>
  );
}
