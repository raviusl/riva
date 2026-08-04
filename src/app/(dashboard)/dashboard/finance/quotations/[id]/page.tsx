import { notFound } from "next/navigation";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { getClientById } from "@/core/client/client";
import {
  listQuotationActivityFeed,
  getQuotation,
} from "@/core/finance/quotation";
import type { QuotationStatus } from "@/core/finance";
import { getProjectById } from "@/core/project/project";
import { QuotationActionsMenu } from "@/features/finance/components/quotations/quotation-actions-menu";
import { QuotationActivityFeed } from "@/features/finance/components/quotations/quotation-activity-feed";
import { QuotationDocumentActions } from "@/features/finance/components/quotations/quotation-document-actions";
import {
  QuotationLineItemsTable,
  QuotationStatusBadge,
  QuotationSummary,
} from "@/features/finance/components/quotations/quotation-line-items";
import { formatFinanceDate } from "@/features/finance/lib/finance-labels";
import {
  FINANCE_WORKSPACE_HUB_ID,
  buildFinanceWorkspaceTabHref,
} from "@/features/finance/lib/finance-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuotationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("finance.read")) {
    notFound();
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

  const [activities, linkedProject, linkedClient] = await Promise.all([
    listQuotationActivityFeed({
      quotationId: quotation.id,
      workspaceId: context.workspace.id,
      companyId: context.company.id,
    }),
    (async () => {
      if (!quotation.projectId) return null;
      try {
        const project = await getProjectById(
          quotation.projectId,
          context.workspace.id,
        );
        return project.company_id === context.company.id ? project : null;
      } catch {
        return null;
      }
    })(),
    (async () => {
      if (!quotation.clientId) return null;
      try {
        return await getClientById(
          quotation.clientId,
          context.workspace.id,
          context.company.id,
        );
      } catch {
        return null;
      }
    })(),
  ]);

  return (
    <WorkspaceLayout
      backHref={buildFinanceWorkspaceTabHref(
        FINANCE_WORKSPACE_HUB_ID,
        "quotations",
        { explicitOverview: true },
      )}
      backLabel={uiZh.backToQuotations}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-white/40">{uiZh.quotationDetail}</p>
            <h1 className="mt-1 text-xl text-white">
              {quotation.referenceNumber ?? uiZh.quotationFallback}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <QuotationStatusBadge
                status={quotation.status as QuotationStatus}
              />
              <span className="text-xs text-white/45">
                {uiZh.issuedAtLabel(formatFinanceDate(quotation.issuedAt))}
              </span>
              <span className="text-xs text-white/45">
                {uiZh.validUntil} {formatFinanceDate(quotation.dueAt)}
              </span>
            </div>
          </div>
          <QuotationActionsMenu
            quotationId={quotation.id}
            workspaceId={quotation.workspaceId}
            companyId={quotation.companyId}
            status={quotation.status as QuotationStatus}
            convertedInvoiceId={quotation.convertedInvoiceId}
            canWrite={context.permissions.has("finance.write")}
            canApprove={context.permissions.has("finance.approve")}
            canDelete={context.permissions.has("finance.delete")}
          />
        </div>

        <QuotationDocumentActions
          quotationId={quotation.id}
          workspaceId={quotation.workspaceId}
          companyId={quotation.companyId}
          canWrite={context.permissions.has("finance.write")}
        />

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
          <QuotationSummary
            amount={quotation.amount}
            tax={quotation.tax}
            discount={quotation.discount}
            currency={quotation.currency}
          />
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
            {linkedClient ? (
              <WorkspaceEntityLink
                kind="client"
                id={linkedClient.id}
                className="text-white/70 hover:text-white"
              >
                {linkedClient.name}
              </WorkspaceEntityLink>
            ) : null}
            {linkedProject ? (
              <WorkspaceEntityLink
                kind="project"
                id={linkedProject.id}
                className="text-white/70 hover:text-white"
              >
                {linkedProject.name}
              </WorkspaceEntityLink>
            ) : null}
            {quotation.convertedInvoiceId ? (
              <span>
                Invoice: {quotation.convertedInvoiceId.slice(0, 8)}…
              </span>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
          <h2 className="text-sm font-medium text-white">{uiZh.lineItems}</h2>
          <div className="mt-4">
            <QuotationLineItemsTable
              items={quotation.lineItems}
              currency={quotation.currency}
            />
          </div>
        </section>

        {quotation.notes ? (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
            <h2 className="text-sm font-medium text-white">
              {uiZh.quotationNotes}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
              {quotation.notes}
            </p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
          <h2 className="text-sm font-medium text-white">
            {uiZh.recentActivityTitle}
          </h2>
          <div className="mt-4">
            <QuotationActivityFeed activities={activities} />
          </div>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
