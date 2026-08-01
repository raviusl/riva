"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiZh } from "@/config/ui-zh";
import { updateQuotationAction } from "@/core/actions/finance-actions";
import type { QuotationWithLines } from "@/core/finance";
import type { Client, Project, Vendor } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  QuotationLineItemsEditor,
  type LineItemDraft,
} from "@/features/finance/components/quotations/quotation-line-items";

type EditQuotationFormProps = {
  quotation: QuotationWithLines;
  projects: Project[];
  clients: Client[];
  vendors: Vendor[];
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function EditQuotationForm({
  quotation,
  projects,
  clients,
  vendors,
}: EditQuotationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [referenceNumber, setReferenceNumber] = useState(
    quotation.referenceNumber ?? "",
  );
  const [currency, setCurrency] = useState(quotation.currency);
  const [projectId, setProjectId] = useState(quotation.projectId ?? "");
  const [clientId, setClientId] = useState(quotation.clientId ?? "");
  const [vendorId, setVendorId] = useState(quotation.vendorId ?? "");
  const [dueAt, setDueAt] = useState(toDateInput(quotation.dueAt));
  const [notes, setNotes] = useState(quotation.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(
    quotation.internalNotes ?? "",
  );
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(
    quotation.lineItems.map((item) => ({
      key: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.tax,
      discount: item.discount,
    })),
  );

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (lineItems.some((item) => !item.description.trim())) {
      toast.error(uiZh.lineDescriptionRequired);
      return;
    }

    startTransition(async () => {
      const result = await updateQuotationAction({
        quotationId: quotation.id,
        workspaceId: quotation.workspaceId,
        companyId: quotation.companyId,
        projectId: projectId || null,
        clientId: clientId || null,
        vendorId: vendorId || null,
        currency,
        referenceNumber: referenceNumber.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        notes: notes.trim() || null,
        internalNotes: internalNotes.trim() || null,
        lineItems: lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          tax: item.tax,
          discount: item.discount,
        })),
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(uiZh.saveChanges);
      router.push(`/dashboard/finance/quotations/${quotation.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.referenceNumber}</Label>
          <Input
            className={authFieldClassName}
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/70">Currency</Label>
          <Input
            className={authFieldClassName}
            value={currency}
            maxLength={3}
            onChange={(event) => setCurrency(event.target.value.toUpperCase())}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.client}</Label>
          <select
            className={authFieldClassName}
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          >
            <option value="">—</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.projectSingular}</Label>
          <select
            className={authFieldClassName}
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="">—</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.vendors}</Label>
          <select
            className={authFieldClassName}
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
          >
            <option value="">—</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.validUntil}</Label>
          <Input
            type="date"
            className={authFieldClassName}
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
          />
        </div>
      </div>

      <QuotationLineItemsEditor
        items={lineItems}
        onChange={setLineItems}
        disabled={pending}
      />

      <div className="space-y-1.5">
        <Label className="text-white/70">{uiZh.quotationNotes}</Label>
        <textarea
          className={`${authFieldClassName} min-h-24`}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/70">{uiZh.internalNotes}</Label>
        <textarea
          className={`${authFieldClassName} min-h-20`}
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {uiZh.saveChanges}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            router.push(`/dashboard/finance/quotations/${quotation.id}`)
          }
        >
          {uiZh.cancel}
        </Button>
      </div>
    </form>
  );
}
