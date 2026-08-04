"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import {
  downloadFinanceDocumentAction,
  regenerateFinanceDocumentAction,
} from "@/core/actions/document-engine-actions";
import { cn } from "@/lib/utils";

type QuotationDocumentActionsProps = {
  quotationId: string;
  workspaceId: string;
  companyId: string;
  canWrite: boolean;
};

export function QuotationDocumentActions({
  quotationId,
  workspaceId,
  companyId,
  canWrite,
}: QuotationDocumentActionsProps) {
  const [pending, startTransition] = useTransition();
  const scope = {
    financeId: quotationId,
    workspaceId,
    companyId,
    kind: "quotation" as const,
  };

  function openUrl(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function comingSoon() {
    toast.message(uiZh.comingSoonAction);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/dashboard/finance/quotations/${quotationId}/document`}
        className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
      >
        {uiZh.previewDocument}
      </Link>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await regenerateFinanceDocumentAction(scope);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.documentRegenerated);
            openUrl(result.data.signedUrl);
          });
        }}
      >
        {uiZh.generatePdf}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await downloadFinanceDocumentAction(scope);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.documentReady);
            openUrl(result.data.signedUrl);
          });
        }}
      >
        {uiZh.downloadDocument}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={comingSoon}>
        {uiZh.emailClient}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={comingSoon}>
        {uiZh.whatsappClient}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={comingSoon}>
        {uiZh.duplicateQuotation}
      </Button>
      {canWrite ? (
        <>
          <Button type="button" size="sm" variant="ghost" onClick={comingSoon}>
            {uiZh.convertToInvoice}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={comingSoon}>
            {uiZh.convertToContract}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={comingSoon}>
            {uiZh.convertToBooking}
          </Button>
        </>
      ) : null}
    </div>
  );
}
