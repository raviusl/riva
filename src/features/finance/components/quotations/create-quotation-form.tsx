"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiZh } from "@/config/ui-zh";
import { createQuotationAction } from "@/core/actions/finance-actions";
import type { Client, Project, Vendor } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  QuotationLineItemsEditor,
  type LineItemDraft,
} from "@/features/finance/components/quotations/quotation-line-items";

type CreateQuotationFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Project[];
  clients: Client[];
  vendors: Vendor[];
  defaultProjectId?: string;
  defaultClientId?: string;
};

export function CreateQuotationForm({
  workspaceId,
  companyId,
  projects,
  clients,
  vendors,
  defaultProjectId = "",
  defaultClientId = "",
}: CreateQuotationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currency, setCurrency] = useState("USD");
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [clientId, setClientId] = useState(defaultClientId);
  const [vendorId, setVendorId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([
    {
      key: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      discount: 0,
    },
  ]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (lineItems.some((item) => !item.description.trim())) {
      toast.error(uiZh.lineDescriptionRequired);
      return;
    }

    startTransition(async () => {
      const result = await createQuotationAction({
        workspaceId,
        companyId,
        projectId: projectId || null,
        clientId: clientId || null,
        vendorId: vendorId || null,
        category: "general",
        currency,
        referenceNumber: null,
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

      toast.success(uiZh.quotationCreated);
      router.push("/dashboard/finance/quotations");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.quotationNumber}</Label>
          <Input
            className={authFieldClassName}
            value={uiZh.quotationNumberAuto}
            disabled
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-white/70">{uiZh.currency}</Label>
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
          {uiZh.createQuotation}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => router.push("/dashboard/finance/quotations")}
        >
          {uiZh.cancel}
        </Button>
      </div>
    </form>
  );
}
