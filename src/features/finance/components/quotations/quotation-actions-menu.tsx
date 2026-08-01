"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import {
  acceptQuotationAction,
  convertQuotationToInvoiceAction,
  expireQuotationAction,
  rejectQuotationAction,
  sendQuotationAction,
  voidQuotationAction,
} from "@/core/actions/finance-actions";
import type { QuotationStatus } from "@/core/finance";

type QuotationActionsMenuProps = {
  quotationId: string;
  workspaceId: string;
  companyId: string;
  status: QuotationStatus;
  convertedInvoiceId: string | null;
  canWrite: boolean;
  canApprove: boolean;
  canDelete: boolean;
};

export function QuotationActionsMenu({
  quotationId,
  workspaceId,
  companyId,
  status,
  convertedInvoiceId,
  canWrite,
  canApprove,
  canDelete,
}: QuotationActionsMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const scope = { quotationId, workspaceId, companyId };

  function run(
    action: () => Promise<{ ok: true; data: unknown } | { ok: false; error: string }>,
    successMessage: string,
  ) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && canWrite ? (
        <>
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() =>
              router.push(`/dashboard/finance/quotations/${quotationId}/edit`)
            }
          >
            {uiZh.editQuotation}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(() => sendQuotationAction(scope), uiZh.sendQuotation)
            }
          >
            {uiZh.sendQuotation}
          </Button>
        </>
      ) : null}

      {status === "sent" && canWrite ? (
        <>
          {(canApprove || canWrite) && (
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() =>
                run(() => acceptQuotationAction(scope), uiZh.acceptQuotation)
              }
            >
              {uiZh.acceptQuotation}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(() => rejectQuotationAction(scope), uiZh.rejectQuotation)
            }
          >
            {uiZh.rejectQuotation}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() =>
              run(() => expireQuotationAction(scope), uiZh.expireQuotation)
            }
          >
            {uiZh.expireQuotation}
          </Button>
        </>
      ) : null}

      {status === "accepted" && canWrite && !convertedInvoiceId ? (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() =>
            run(
              () => convertQuotationToInvoiceAction(scope),
              uiZh.convertToInvoice,
            )
          }
        >
          {uiZh.convertToInvoice}
        </Button>
      ) : null}

      {status !== "void" &&
      status !== "cancelled" &&
      status !== "rejected" &&
      status !== "expired" &&
      (canDelete || canApprove) ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            run(() => voidQuotationAction(scope), uiZh.voidQuotation)
          }
        >
          {uiZh.voidQuotation}
        </Button>
      ) : null}
    </div>
  );
}
