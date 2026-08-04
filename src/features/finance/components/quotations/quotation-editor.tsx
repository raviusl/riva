"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiZh } from "@/config/ui-zh";
import {
  createQuotationAction,
  updateQuotationAction,
} from "@/core/actions/finance-actions";
import {
  EVENT_CATEGORIES,
  eventDayLabelFromDate,
  formatCompanyBankDetails,
  parseQuotationDocumentContent,
  type EventCategory,
  type QuotationDocumentContent,
} from "@/core/finance/document-content";
import type { FinancePackageWithItems } from "@/core/finance/packages";
import type { QuotationWithLines } from "@/core/finance/types";
import type { Client, Company, Project, Vendor } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  QuotationLineItemsEditor,
  blankLineItem,
  type LineItemDraft,
} from "@/features/finance/components/quotations/quotation-line-items";
import { formatFinanceMoney } from "@/features/finance/lib/finance-labels";

type QuotationEditorProps = {
  mode: "create" | "edit";
  workspaceId: string;
  company: Company;
  projects: Project[];
  clients: Client[];
  vendors: Vendor[];
  packages: FinancePackageWithItems[];
  preparedByName: string;
  quotation?: QuotationWithLines;
  defaultProjectId?: string;
  defaultClientId?: string;
};

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <div>
        <h2 className="text-sm font-medium text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-white/45">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  wedding: "Wedding",
  rom: "ROM",
  corporate: "Corporate",
  dinner: "Dinner",
  birthday: "Birthday",
  conference: "Conference",
  award_night: "Award Night",
  product_launch: "Product Launch",
  concert: "Concert",
  festival: "Festival",
  others: "Others",
};

export function QuotationEditor({
  mode,
  workspaceId,
  company,
  projects,
  clients,
  vendors,
  packages,
  preparedByName,
  quotation,
  defaultProjectId = "",
  defaultClientId = "",
}: QuotationEditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initialContent: QuotationDocumentContent = useMemo(() => {
    const stored = parseQuotationDocumentContent(
      quotation?.documentContent ?? {},
    );
    if (quotation?.documentContent) return stored;
    return {
      ...stored,
      preparedBy: preparedByName || null,
      salesPerson: preparedByName || null,
      paymentTerms: company.default_payment_terms,
      termsAndConditions: company.default_terms_and_conditions,
      bankDetails: formatCompanyBankDetails({
        companyName: company.name,
        accountName: company.bank_account_name,
        bankName: company.bank_name,
        accountNumber: company.bank_account_number,
        swiftCode: company.swift_code,
      }),
      footer:
        company.default_document_footer ??
        "Thank you for choosing Ruyan Weddings. This is a computer-generated quotation. No signature is required.",
      validityLabel: "1 WEEK / 7 DAYS",
      deliveryTerm: "DATE AS PER QUOTATION STATED",
      pricing: {
        ...stored.pricing,
        depositPercent: 50,
      },
    };
  }, [company, preparedByName, quotation]);

  const [referenceNumber, setReferenceNumber] = useState(
    quotation?.referenceNumber ?? "",
  );
  const [currency, setCurrency] = useState(
    quotation?.currency ?? company.currency ?? "MYR",
  );
  const [projectId, setProjectId] = useState(
    quotation?.projectId ?? defaultProjectId,
  );
  const [clientId, setClientId] = useState(
    quotation?.clientId ?? defaultClientId,
  );
  const [vendorId, setVendorId] = useState(quotation?.vendorId ?? "");
  const [issuedAt, setIssuedAt] = useState(
    toDateInput(quotation?.issuedAt) || toDateInput(new Date().toISOString()),
  );
  const [dueAt, setDueAt] = useState(toDateInput(quotation?.dueAt));
  const [notes, setNotes] = useState(quotation?.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(
    quotation?.internalNotes ?? "",
  );
  const [content, setContent] =
    useState<QuotationDocumentContent>(initialContent);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() => {
    if (quotation?.lineItems?.length) {
      return quotation.lineItems.map((item) => ({
        key: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax,
        discount: item.discount,
        itemKind: item.itemKind ?? "line",
        unitOfMeasure: item.unitOfMeasure ?? "Lot",
        notes: item.notes,
      }));
    }
    return [blankLineItem("line")];
  });
  const [packagePick, setPackagePick] = useState("");

  const packageLines = lineItems.filter((item) => {
    const kind = item.itemKind ?? "line";
    return kind === "package" || kind === "line";
  });
  const chargeLines = lineItems.filter((item) => {
    const kind = item.itemKind ?? "line";
    return kind === "charge" || kind === "discount";
  });

  const pricing = useMemo(() => {
    const rows = [...packageLines, ...chargeLines];
    const subtotal = roundMoney(
      rows.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0),
    );
    const lineDiscount = roundMoney(
      rows.reduce((sum, row) => sum + (row.discount || 0), 0),
    );
    const packageDiscount = content.pricing.packageDiscount ?? 0;
    const manualDiscount = content.pricing.manualDiscount ?? 0;
    const tax = roundMoney(rows.reduce((sum, row) => sum + (row.tax || 0), 0));
    const discount = roundMoney(
      lineDiscount + packageDiscount + manualDiscount,
    );
    const grandTotal = roundMoney(Math.max(0, subtotal - discount + tax));
    const depositPercent = content.pricing.depositPercent;
    const depositAmount =
      content.pricing.depositAmount != null
        ? content.pricing.depositAmount
        : depositPercent != null
          ? roundMoney((grandTotal * depositPercent) / 100)
          : 0;
    const balanceAmount = roundMoney(
      content.pricing.balanceAmount ?? Math.max(0, grandTotal - depositAmount),
    );
    return {
      subtotal,
      discount,
      tax,
      grandTotal,
      depositAmount,
      balanceAmount,
    };
  }, [chargeLines, content.pricing, packageLines]);

  function patchContent(patch: Partial<QuotationDocumentContent>) {
    setContent((prev) => ({ ...prev, ...patch }));
  }

  function patchBillTo(
    patch: Partial<QuotationDocumentContent["billTo"]>,
  ) {
    setContent((prev) => ({
      ...prev,
      billTo: { ...prev.billTo, ...patch },
    }));
  }

  function patchWedding(
    patch: Partial<QuotationDocumentContent["wedding"]>,
  ) {
    setContent((prev) => ({
      ...prev,
      wedding: { ...prev.wedding, ...patch },
    }));
  }

  function patchEvent(patch: Partial<QuotationDocumentContent["event"]>) {
    setContent((prev) => ({
      ...prev,
      event: { ...prev.event, ...patch },
    }));
  }

  function patchPricing(
    patch: Partial<QuotationDocumentContent["pricing"]>,
  ) {
    setContent((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, ...patch },
    }));
  }

  function onClientChange(nextId: string) {
    setClientId(nextId);
    const client = clients.find((row) => row.id === nextId);
    if (!client) return;
    patchBillTo({
      name: client.name,
      phone: client.phone,
      email: client.email,
    });
    if (!content.contactPerson) {
      patchContent({ contactPerson: client.name });
    }
  }

  function onProjectChange(nextId: string) {
    setProjectId(nextId);
    const project = projects.find((row) => row.id === nextId);
    if (!project) return;
    const date = project.start_date;
    patchEvent({
      title: project.name,
      date: date,
      dayLabel: eventDayLabelFromDate(date),
      notes: project.description,
    });
  }

  function addPackageFromLibrary(packageId: string) {
    setPackagePick("");
    if (!packageId) return;
    const selected = packages.find((row) => row.id === packageId);
    if (!selected) return;

    const nextPackageLines: LineItemDraft[] = selected.items.map((item) => ({
      key: crypto.randomUUID(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: selected.defaultTax || 0,
      discount: 0,
      itemKind: "package" as const,
      unitOfMeasure: item.unitOfMeasure ?? "Lot",
      notes: null,
    }));

    if (nextPackageLines.length === 0) {
      nextPackageLines.push({
        ...blankLineItem("package"),
        description: selected.name,
        unitPrice: 0,
        notes: selected.description,
      });
    }

    setLineItems((prev) => {
      const charges = prev.filter((item) => {
        const kind = item.itemKind ?? "line";
        return kind === "charge" || kind === "discount";
      });
      return [...nextPackageLines, ...charges];
    });
    patchContent({
      packageId: selected.id,
      packageIds: Array.from(
        new Set([...(content.packageIds ?? []), selected.id]),
      ),
    });
  }

  function setPackageLines(next: LineItemDraft[]) {
    setLineItems([
      ...next.map((item) => ({
        ...item,
        itemKind:
          item.itemKind === "discount" ? "line" : (item.itemKind ?? "line"),
      })),
      ...chargeLines,
    ]);
  }

  function setChargeLines(next: LineItemDraft[]) {
    setLineItems([
      ...packageLines,
      ...next.map((item) => ({
        ...item,
        itemKind:
          item.itemKind === "discount" || item.unitPrice < 0
            ? ("discount" as const)
            : ("charge" as const),
      })),
    ]);
  }

  function onEventDateChange(value: string) {
    const iso = value ? new Date(value).toISOString() : null;
    patchEvent({
      date: iso,
      dayLabel: eventDayLabelFromDate(iso),
    });
  }

  function addAttachment() {
    patchContent({
      attachments: [
        ...content.attachments,
        {
          id: crypto.randomUUID(),
          name: "",
          url: "",
          mimeType: null,
        },
      ],
    });
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const allLines = [...packageLines, ...chargeLines];
    if (
      allLines.length === 0 ||
      allLines.some((item) => !item.description.trim())
    ) {
      toast.error(uiZh.lineDescriptionRequired);
      return;
    }
    if (!content.event.title?.trim()) {
      toast.error(uiZh.eventTitleRequired);
      return;
    }

    const payloadLines = allLines.map((item) => {
      const isDiscount = item.itemKind === "discount";
      const amountValue = Math.abs(item.unitPrice) * item.quantity;
      return {
        description: item.description.trim(),
        quantity: isDiscount ? 1 : item.quantity,
        unitPrice: isDiscount ? 0 : Math.abs(item.unitPrice),
        tax: item.tax,
        discount: isDiscount ? amountValue : item.discount,
        itemKind: item.itemKind ?? "line",
        unitOfMeasure: item.unitOfMeasure?.trim() || null,
        notes: item.notes?.trim() || null,
      };
    });

    const documentContent: QuotationDocumentContent = {
      ...content,
      eventNotes: content.eventNotes || content.event.notes,
      pricing: {
        ...content.pricing,
        depositAmount: pricing.depositAmount,
        balanceAmount: pricing.balanceAmount,
      },
      bankDetails:
        content.bankDetails ||
        formatCompanyBankDetails({
          companyName: company.name,
          accountName: company.bank_account_name,
          bankName: company.bank_name,
          accountNumber: company.bank_account_number,
          swiftCode: company.swift_code,
        }),
    };

    startTransition(async () => {
      if (mode === "create") {
        const result = await createQuotationAction({
          workspaceId,
          companyId: company.id,
          projectId: projectId || null,
          clientId: clientId || null,
          vendorId: vendorId || null,
          category: "general",
          currency,
          referenceNumber: referenceNumber.trim() || null,
          issuedAt: issuedAt ? new Date(issuedAt).toISOString() : null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          notes: notes.trim() || null,
          internalNotes: internalNotes.trim() || null,
          documentContent,
          lineItems: payloadLines,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.quotationCreated);
        router.push(`/dashboard/finance/quotations/${result.data.quotationId}`);
        router.refresh();
        return;
      }

      if (!quotation) return;
      const result = await updateQuotationAction({
        quotationId: quotation.id,
        workspaceId: quotation.workspaceId,
        companyId: quotation.companyId,
        projectId: projectId || null,
        clientId: clientId || null,
        vendorId: vendorId || null,
        currency,
        referenceNumber: referenceNumber.trim() || null,
        issuedAt: issuedAt ? new Date(issuedAt).toISOString() : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        notes: notes.trim() || null,
        internalNotes: internalNotes.trim() || null,
        documentContent,
        lineItems: payloadLines,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(uiZh.quotationUpdated);
      router.push(`/dashboard/finance/quotations/${quotation.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* SECTION 1 — Company */}
      <Section
        title={uiZh.companyInformation}
        description={uiZh.companyInformationHint}
      >
        <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-2">
          <p>
            <span className="text-white/40">{uiZh.companyName}</span>
            <br />
            {company.name}
          </p>
          <p>
            <span className="text-white/40">{uiZh.registrationNo}</span>
            <br />
            {company.registration_no || uiZh.emDash}
          </p>
          <p className="sm:col-span-2">
            <span className="text-white/40">{uiZh.address}</span>
            <br />
            {company.address || uiZh.emDash}
          </p>
          <p>
            <span className="text-white/40">{uiZh.phone}</span>
            <br />
            {company.phone || uiZh.emDash}
          </p>
          <p>
            <span className="text-white/40">{uiZh.email}</span>
            <br />
            {company.email || uiZh.emDash}
          </p>
          <p>
            <span className="text-white/40">{uiZh.website}</span>
            <br />
            {company.website || uiZh.emDash}
          </p>
          <p>
            <span className="text-white/40">{uiZh.bankName}</span>
            <br />
            {company.bank_name || uiZh.emDash}
          </p>
        </div>
      </Section>

      {/* SECTION 2 — Quotation metadata */}
      <Section title={uiZh.quotationMetadata}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.quotationNumber}</Label>
            <Input
              className={authFieldClassName}
              value={referenceNumber}
              placeholder={uiZh.quotationNumberAuto}
              onChange={(event) => setReferenceNumber(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.status}</Label>
            <Input
              className={authFieldClassName}
              value={quotation?.status ?? "draft"}
              disabled
              readOnly
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.issueDate}</Label>
            <Input
              type="date"
              className={authFieldClassName}
              value={issuedAt}
              onChange={(event) => setIssuedAt(event.target.value)}
            />
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
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.preparedBy}</Label>
            <Input
              className={authFieldClassName}
              value={content.preparedBy ?? ""}
              onChange={(event) =>
                patchContent({ preparedBy: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.salesPerson}</Label>
            <Input
              className={authFieldClassName}
              value={content.salesPerson ?? ""}
              onChange={(event) =>
                patchContent({ salesPerson: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.currency}</Label>
            <Input
              className={authFieldClassName}
              value={currency}
              maxLength={3}
              onChange={(event) =>
                setCurrency(event.target.value.toUpperCase())
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.yourReference}</Label>
            <Input
              className={authFieldClassName}
              value={content.yourReference ?? ""}
              onChange={(event) =>
                patchContent({ yourReference: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.internalReference}</Label>
            <Input
              className={authFieldClassName}
              value={content.internalReference ?? ""}
              onChange={(event) =>
                patchContent({ internalReference: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.ccLabel}</Label>
            <Input
              className={authFieldClassName}
              value={content.cc ?? ""}
              onChange={(event) => patchContent({ cc: event.target.value })}
            />
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
        </div>
      </Section>

      {/* SECTION 3 — Client */}
      <Section title={uiZh.billToSection}>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["corporate", "wedding"] as const).map((modeOption) => (
            <button
              key={modeOption}
              type="button"
              onClick={() => patchContent({ clientMode: modeOption })}
              className={`rounded-lg border px-3 py-1.5 text-xs ${
                content.clientMode === modeOption
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              {modeOption === "corporate"
                ? uiZh.corporateMode
                : uiZh.weddingMode}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.client}</Label>
            <select
              className={authFieldClassName}
              value={clientId}
              onChange={(event) => onClientChange(event.target.value)}
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
            <Label className="text-white/70">{uiZh.billToName}</Label>
            <Input
              className={authFieldClassName}
              value={content.billTo.name ?? ""}
              onChange={(event) => patchBillTo({ name: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.billToRegistration}</Label>
            <Input
              className={authFieldClassName}
              value={content.billTo.registrationNo ?? ""}
              onChange={(event) =>
                patchBillTo({ registrationNo: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.attentionTo}</Label>
            <Input
              className={authFieldClassName}
              value={content.attentionTo ?? ""}
              onChange={(event) =>
                patchContent({ attentionTo: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.contactPerson}</Label>
            <Input
              className={authFieldClassName}
              value={content.contactPerson ?? ""}
              onChange={(event) =>
                patchContent({ contactPerson: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.phone}</Label>
            <Input
              className={authFieldClassName}
              value={content.billTo.phone ?? ""}
              onChange={(event) => patchBillTo({ phone: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.email}</Label>
            <Input
              className={authFieldClassName}
              value={content.billTo.email ?? ""}
              onChange={(event) => patchBillTo({ email: event.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.billToAddress}</Label>
            <textarea
              className={`${authFieldClassName} min-h-20`}
              value={content.billTo.address ?? ""}
              onChange={(event) =>
                patchBillTo({ address: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.shippingAddress}</Label>
            <textarea
              className={`${authFieldClassName} min-h-16`}
              value={content.billTo.shippingAddress ?? ""}
              onChange={(event) =>
                patchBillTo({ shippingAddress: event.target.value })
              }
            />
          </div>
          {content.clientMode === "wedding" ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-white/70">{uiZh.brideName}</Label>
                <Input
                  className={authFieldClassName}
                  value={content.wedding.brideName ?? ""}
                  onChange={(event) =>
                    patchWedding({ brideName: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70">{uiZh.groomName}</Label>
                <Input
                  className={authFieldClassName}
                  value={content.wedding.groomName ?? ""}
                  onChange={(event) =>
                    patchWedding({ groomName: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-white/70">{uiZh.coupleDisplayName}</Label>
                <Input
                  className={authFieldClassName}
                  value={content.wedding.coupleDisplayName ?? ""}
                  onChange={(event) =>
                    patchWedding({ coupleDisplayName: event.target.value })
                  }
                />
              </div>
            </>
          ) : null}
        </div>
      </Section>

      {/* SECTION 4 — Event (mandatory) */}
      <Section
        title={uiZh.eventInformation}
        description={uiZh.eventInformationRequired}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.projectSingular}</Label>
            <select
              className={authFieldClassName}
              value={projectId}
              onChange={(event) => onProjectChange(event.target.value)}
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
            <Label className="text-white/70">{uiZh.eventCategory}</Label>
            <select
              className={authFieldClassName}
              value={content.event.category ?? ""}
              onChange={(event) =>
                patchEvent({
                  category: (event.target.value || null) as EventCategory | null,
                })
              }
            >
              <option value="">—</option>
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {EVENT_CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.eventTitle}</Label>
            <Input
              className={authFieldClassName}
              value={content.event.title ?? ""}
              required
              onChange={(event) => patchEvent({ title: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.eventVenue}</Label>
            <Input
              className={authFieldClassName}
              value={content.event.venue ?? ""}
              onChange={(event) => patchEvent({ venue: event.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.eventLocation}</Label>
            <Input
              className={authFieldClassName}
              value={content.event.location ?? ""}
              onChange={(event) =>
                patchEvent({ location: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.venueAddress}</Label>
            <textarea
              className={`${authFieldClassName} min-h-16`}
              value={content.event.venueAddress ?? ""}
              onChange={(event) =>
                patchEvent({ venueAddress: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.mapLink}</Label>
            <Input
              className={authFieldClassName}
              value={content.event.mapLink ?? ""}
              placeholder="https://maps.google.com/..."
              onChange={(event) =>
                patchEvent({ mapLink: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.eventDate}</Label>
            <Input
              type="date"
              className={authFieldClassName}
              value={toDateInput(content.event.date)}
              onChange={(event) => onEventDateChange(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.eventDay}</Label>
            <Input
              className={authFieldClassName}
              value={content.event.dayLabel ?? ""}
              readOnly
              disabled
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.startTime}</Label>
            <Input
              type="time"
              className={authFieldClassName}
              value={content.event.startTime ?? ""}
              onChange={(event) =>
                patchEvent({ startTime: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.endTime}</Label>
            <Input
              type="time"
              className={authFieldClassName}
              value={content.event.endTime ?? ""}
              onChange={(event) =>
                patchEvent({ endTime: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.guestCount}</Label>
            <Input
              type="number"
              min={0}
              className={authFieldClassName}
              value={content.event.guestCount ?? ""}
              onChange={(event) =>
                patchEvent({
                  guestCount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.dressCode}</Label>
            <Input
              className={authFieldClassName}
              value={content.event.dressCode ?? ""}
              onChange={(event) =>
                patchEvent({ dressCode: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.parkingNotes}</Label>
            <textarea
              className={`${authFieldClassName} min-h-14`}
              value={content.event.parkingNotes ?? ""}
              onChange={(event) =>
                patchEvent({ parkingNotes: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.loadingBayNotes}</Label>
            <textarea
              className={`${authFieldClassName} min-h-14`}
              value={content.event.loadingBayNotes ?? ""}
              onChange={(event) =>
                patchEvent({ loadingBayNotes: event.target.value })
              }
            />
          </div>
        </div>
      </Section>

      {/* SECTION 5–6 — Package + Line items */}
      <Section
        title={uiZh.packageLibrary}
        description={uiZh.packageLibraryHint}
      >
        <div className="flex flex-wrap gap-2">
          <select
            className={`${authFieldClassName} min-w-[220px] flex-1`}
            value={packagePick}
            onChange={(event) => addPackageFromLibrary(event.target.value)}
          >
            <option value="">{uiZh.selectPackage}</option>
            {packages.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
                {row.category ? ` · ${row.category}` : ""}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!packagePick}
            onClick={() => addPackageFromLibrary(packagePick)}
          >
            {uiZh.addPackage}
          </Button>
        </div>
        <div className="mt-4">
          <QuotationLineItemsEditor
            items={packageLines}
            onChange={setPackageLines}
            disabled={pending}
          />
        </div>
      </Section>

      {/* SECTION 7 — Additional charges */}
      <Section
        title={uiZh.additionalCharges}
        description={uiZh.additionalChargesHint}
      >
        <QuotationLineItemsEditor
          items={chargeLines}
          onChange={setChargeLines}
          disabled={pending}
          allowEmpty
          addLabel={uiZh.addCharge}
        />
      </Section>

      {/* SECTION 8 — Pricing summary */}
      <Section title={uiZh.pricingSummary}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.packageDiscount}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              className={authFieldClassName}
              value={content.pricing.packageDiscount ?? ""}
              onChange={(event) =>
                patchPricing({
                  packageDiscount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.manualDiscount}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              className={authFieldClassName}
              value={content.pricing.manualDiscount ?? ""}
              onChange={(event) =>
                patchPricing({
                  manualDiscount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.depositPercent}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step="1"
              className={authFieldClassName}
              value={content.pricing.depositPercent ?? ""}
              onChange={(event) =>
                patchPricing({
                  depositPercent: event.target.value
                    ? Number(event.target.value)
                    : null,
                  depositAmount: null,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.depositAmount}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              className={authFieldClassName}
              value={content.pricing.depositAmount ?? ""}
              onChange={(event) =>
                patchPricing({
                  depositAmount: event.target.value
                    ? Number(event.target.value)
                    : null,
                })
              }
            />
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/70">
          <div className="flex justify-between gap-3">
            <span>{uiZh.subtotal}</span>
            <span>{formatFinanceMoney(pricing.subtotal, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>{uiZh.discount}</span>
            <span>{formatFinanceMoney(pricing.discount, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>{uiZh.tax}</span>
            <span>{formatFinanceMoney(pricing.tax, currency)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-3 text-white">
            <span>{uiZh.grandTotal}</span>
            <span>{formatFinanceMoney(pricing.grandTotal, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>{uiZh.deposit}</span>
            <span>{formatFinanceMoney(pricing.depositAmount, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>{uiZh.balanceDue}</span>
            <span>{formatFinanceMoney(pricing.balanceAmount, currency)}</span>
          </div>
        </div>
      </Section>

      {/* SECTION 9 — Event notes */}
      <Section title={uiZh.eventNotes}>
        <textarea
          className={`${authFieldClassName} min-h-28`}
          value={content.eventNotes ?? ""}
          placeholder={uiZh.eventNotesPlaceholder}
          onChange={(event) =>
            patchContent({ eventNotes: event.target.value })
          }
        />
      </Section>

      {/* SECTION 10 — Terms */}
      <Section title={uiZh.termsAndConditions}>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-white/70">{uiZh.validityLabel}</Label>
              <Input
                className={authFieldClassName}
                value={content.validityLabel ?? ""}
                onChange={(event) =>
                  patchContent({ validityLabel: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70">{uiZh.deliveryTerm}</Label>
              <Input
                className={authFieldClassName}
                value={content.deliveryTerm ?? ""}
                onChange={(event) =>
                  patchContent({ deliveryTerm: event.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.paymentTerms}</Label>
            <textarea
              className={`${authFieldClassName} min-h-20`}
              value={content.paymentTerms ?? ""}
              onChange={(event) =>
                patchContent({ paymentTerms: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.termsAndConditions}</Label>
            <textarea
              className={`${authFieldClassName} min-h-28`}
              value={content.termsAndConditions ?? ""}
              onChange={(event) =>
                patchContent({ termsAndConditions: event.target.value })
              }
            />
          </div>
        </div>
      </Section>

      {/* SECTION 11 — Payment details */}
      <Section
        title={uiZh.paymentDetails}
        description={uiZh.paymentDetailsHint}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/70">{uiZh.bankDetails}</Label>
            <textarea
              className={`${authFieldClassName} min-h-20`}
              value={content.bankDetails ?? ""}
              onChange={(event) =>
                patchContent({ bankDetails: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.paymentReference}</Label>
            <Input
              className={authFieldClassName}
              value={content.paymentReference ?? ""}
              onChange={(event) =>
                patchContent({ paymentReference: event.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/70">{uiZh.documentFooter}</Label>
            <Input
              className={authFieldClassName}
              value={content.footer ?? ""}
              onChange={(event) => patchContent({ footer: event.target.value })}
            />
          </div>
        </div>
      </Section>

      {/* SECTION 12 — Internal notes */}
      <Section
        title={uiZh.internalNotes}
        description={uiZh.internalNotesHint}
      >
        <textarea
          className={`${authFieldClassName} min-h-20`}
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
        />
        <div className="mt-3 space-y-1.5">
          <Label className="text-white/70">{uiZh.quotationNotes}</Label>
          <textarea
            className={`${authFieldClassName} min-h-16`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </Section>

      {/* SECTION 13 — Attachments */}
      <Section
        title={uiZh.attachments}
        description={uiZh.attachmentsHint}
      >
        <div className="space-y-3">
          {content.attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className="grid gap-2 rounded-xl border border-white/[0.06] p-3 sm:grid-cols-2"
            >
              <Input
                className={authFieldClassName}
                placeholder={uiZh.attachmentName}
                value={attachment.name ?? ""}
                onChange={(event) => {
                  const next = [...content.attachments];
                  next[index] = { ...attachment, name: event.target.value };
                  patchContent({ attachments: next });
                }}
              />
              <Input
                className={authFieldClassName}
                placeholder={uiZh.attachmentUrl}
                value={attachment.url ?? ""}
                onChange={(event) => {
                  const next = [...content.attachments];
                  next[index] = { ...attachment, url: event.target.value };
                  patchContent({ attachments: next });
                }}
              />
              <button
                type="button"
                className="text-left text-xs text-white/40 hover:text-white/70 sm:col-span-2"
                onClick={() =>
                  patchContent({
                    attachments: content.attachments.filter(
                      (row) => row.id !== attachment.id,
                    ),
                  })
                }
              >
                {uiZh.removeAttachment}
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addAttachment}
          >
            {uiZh.addAttachment}
          </Button>
        </div>
      </Section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {mode === "create" ? uiZh.createQuotation : uiZh.saveChanges}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            router.push(
              mode === "edit" && quotation
                ? `/dashboard/finance/quotations/${quotation.id}`
                : "/dashboard/finance/quotations",
            )
          }
        >
          {uiZh.cancel}
        </Button>
      </div>
    </form>
  );
}
