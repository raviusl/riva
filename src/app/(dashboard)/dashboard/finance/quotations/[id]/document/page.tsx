import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { buttonVariants } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import {
  downloadFinanceDocumentAction,
  previewFinanceDocumentAction,
} from "@/core/actions/document-engine-actions";
import { getQuotation } from "@/core/finance/quotation";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Preview page — loads document via server actions (Node runtime),
 * not via direct react-dom/server imports in the RSC module graph.
 */
export default async function QuotationDocumentPreviewPage({
  params,
}: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("finance.read")) {
    notFound();
  }

  try {
    await getQuotation({
      quotationId: id,
      workspaceId: context.workspace.id,
      companyId: context.company.id,
    });
  } catch {
    notFound();
  }

  const scope = {
    financeId: id,
    workspaceId: context.workspace.id,
    companyId: context.company.id,
    kind: "quotation" as const,
  };

  let html: string | null = null;
  let signedUrl: string | null = null;
  let errorMessage: string | null = null;

  const generated = await downloadFinanceDocumentAction(scope);
  if (generated.ok) {
    signedUrl = generated.data.signedUrl;
  } else {
    const preview = await previewFinanceDocumentAction(scope);
    if (preview.ok) {
      signedUrl = preview.data.signedUrl ?? null;
      html = preview.data.html ?? null;
    } else {
      errorMessage = preview.error || generated.error;
    }
  }

  return (
    <WorkspaceLayout
      backHref={`/dashboard/finance/quotations/${id}`}
      backLabel={uiZh.backToQuotation}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/40">{uiZh.documentPreview}</p>
            <h1 className="mt-1 text-xl text-white">{uiZh.quotationDocument}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {signedUrl ? (
              <a
                href={signedUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {uiZh.openPdf}
              </a>
            ) : null}
            <Link
              href={`/dashboard/finance/quotations/${id}`}
              className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
            >
              {uiZh.back}
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
            {errorMessage}
          </div>
        ) : signedUrl ? (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white">
            <iframe
              title={uiZh.quotationDocument}
              src={signedUrl}
              className="h-[80vh] w-full"
            />
          </div>
        ) : html ? (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white">
            <iframe
              title={uiZh.quotationDocument}
              srcDoc={html}
              className="h-[80vh] w-full bg-white"
            />
          </div>
        ) : null}
      </div>
    </WorkspaceLayout>
  );
}
