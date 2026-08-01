import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { getQuotation } from "@/core/finance/quotation";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { EditQuotationForm } from "@/features/finance/components/quotations/edit-quotation-form";

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

  const [projects, clients, vendors] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listVendorsByCompany(context.workspace.id, context.company.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
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

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditQuotationForm
          quotation={quotation}
          projects={projects}
          clients={clients}
          vendors={vendors}
        />
      </div>
    </div>
  );
}
