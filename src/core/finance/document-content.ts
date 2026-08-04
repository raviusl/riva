/**
 * Structured commercial document content — shared foundation for
 * Quotation / Invoice / Tax Invoice / Receipt / PO / Contract /
 * Booking Confirmation / Event Order / Statement of Account.
 *
 * Stored on finance_records.document_content (jsonb).
 * All fields optional/nullable for backward compatibility.
 */

import { z } from "zod";

export const financeLineItemKindSchema = z.enum([
  "line",
  "package",
  "charge",
  "discount",
]);

export type FinanceLineItemKind = z.infer<typeof financeLineItemKindSchema>;

export const EVENT_CATEGORIES = [
  "wedding",
  "rom",
  "corporate",
  "dinner",
  "birthday",
  "conference",
  "award_night",
  "product_launch",
  "concert",
  "festival",
  "others",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CLIENT_MODES = ["corporate", "wedding"] as const;
export type ClientMode = (typeof CLIENT_MODES)[number];

const looseString = (max: number) =>
  z
    .string()
    .max(max)
    .nullish()
    .transform((value): string | null => value ?? null);

const looseNumber = z
  .number()
  .finite()
  .nullish()
  .transform((value): number | null =>
    value === undefined || value === null || Number.isNaN(value) ? null : value,
  );

const optionalUuid = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") return null;
  return value;
}, z.string().uuid().nullable());

export const quotationBillToSchema = z.object({
  name: looseString(300),
  registrationNo: looseString(120),
  address: looseString(2000),
  shippingAddress: looseString(2000),
  phone: looseString(60),
  email: looseString(320),
  taxNumber: looseString(120),
});

export const quotationWeddingSchema = z.object({
  brideName: looseString(200),
  groomName: looseString(200),
  coupleDisplayName: looseString(300),
});

export const quotationEventSchema = z.object({
  title: looseString(300),
  category: z.enum(EVENT_CATEGORIES).nullish(),
  venue: looseString(300),
  venueAddress: looseString(1000),
  location: looseString(500),
  mapLink: looseString(1000),
  date: looseString(64),
  dayLabel: looseString(40),
  startTime: looseString(32),
  endTime: looseString(32),
  guestCount: looseNumber,
  dressCode: looseString(200),
  parkingNotes: looseString(2000),
  loadingBayNotes: looseString(2000),
  notes: looseString(8000),
});

export const quotationPricingSchema = z.object({
  packageDiscount: looseNumber,
  manualDiscount: looseNumber,
  depositAmount: looseNumber,
  depositPercent: looseNumber,
  balanceAmount: looseNumber,
});

export const quotationAttachmentSchema = z.object({
  id: z.string().min(1).max(80),
  name: looseString(300),
  url: looseString(2000),
  mimeType: looseString(120),
});

export const quotationDocumentContentSchema = z.object({
  clientMode: z.enum(CLIENT_MODES).nullish(),
  billTo: quotationBillToSchema.optional(),
  wedding: quotationWeddingSchema.optional(),
  contactPerson: looseString(200),
  attentionTo: looseString(200),
  yourReference: looseString(120),
  internalReference: looseString(120),
  preparedBy: looseString(200),
  salesPerson: looseString(200),
  cc: looseString(200),
  event: quotationEventSchema.optional(),
  packageId: optionalUuid,
  packageIds: z.array(z.string().uuid()).optional(),
  validityLabel: looseString(200),
  deliveryTerm: looseString(500),
  paymentTerms: looseString(4000),
  termsAndConditions: looseString(8000),
  bankDetails: looseString(2000),
  paymentReference: looseString(200),
  footer: looseString(2000),
  eventNotes: looseString(8000),
  pricing: quotationPricingSchema.optional(),
  attachments: z.array(quotationAttachmentSchema).optional(),
});

export type QuotationDocumentContent = {
  clientMode: ClientMode;
  billTo: {
    name: string | null;
    registrationNo: string | null;
    address: string | null;
    shippingAddress: string | null;
    phone: string | null;
    email: string | null;
    taxNumber: string | null;
  };
  wedding: {
    brideName: string | null;
    groomName: string | null;
    coupleDisplayName: string | null;
  };
  contactPerson: string | null;
  attentionTo: string | null;
  yourReference: string | null;
  internalReference: string | null;
  preparedBy: string | null;
  salesPerson: string | null;
  cc: string | null;
  event: {
    title: string | null;
    category: EventCategory | null;
    venue: string | null;
    venueAddress: string | null;
    location: string | null;
    mapLink: string | null;
    date: string | null;
    dayLabel: string | null;
    startTime: string | null;
    endTime: string | null;
    guestCount: number | null;
    dressCode: string | null;
    parkingNotes: string | null;
    loadingBayNotes: string | null;
    notes: string | null;
  };
  packageId: string | null;
  packageIds: string[];
  validityLabel: string | null;
  deliveryTerm: string | null;
  paymentTerms: string | null;
  termsAndConditions: string | null;
  bankDetails: string | null;
  paymentReference: string | null;
  footer: string | null;
  eventNotes: string | null;
  pricing: {
    packageDiscount: number | null;
    manualDiscount: number | null;
    depositAmount: number | null;
    depositPercent: number | null;
    balanceAmount: number | null;
  };
  attachments: Array<{
    id: string;
    name: string | null;
    url: string | null;
    mimeType: string | null;
  }>;
};

export function emptyQuotationDocumentContent(): QuotationDocumentContent {
  return {
    clientMode: "corporate",
    billTo: {
      name: null,
      registrationNo: null,
      address: null,
      shippingAddress: null,
      phone: null,
      email: null,
      taxNumber: null,
    },
    wedding: {
      brideName: null,
      groomName: null,
      coupleDisplayName: null,
    },
    contactPerson: null,
    attentionTo: null,
    yourReference: null,
    internalReference: null,
    preparedBy: null,
    salesPerson: null,
    cc: null,
    event: {
      title: null,
      category: null,
      venue: null,
      venueAddress: null,
      location: null,
      mapLink: null,
      date: null,
      dayLabel: null,
      startTime: null,
      endTime: null,
      guestCount: null,
      dressCode: null,
      parkingNotes: null,
      loadingBayNotes: null,
      notes: null,
    },
    packageId: null,
    packageIds: [],
    validityLabel: null,
    deliveryTerm: null,
    paymentTerms: null,
    termsAndConditions: null,
    bankDetails: null,
    paymentReference: null,
    footer: null,
    eventNotes: null,
    pricing: {
      packageDiscount: null,
      manualDiscount: null,
      depositAmount: null,
      depositPercent: null,
      balanceAmount: null,
    },
    attachments: [],
  };
}

function asEventCategory(value: unknown): EventCategory | null {
  if (
    typeof value === "string" &&
    (EVENT_CATEGORIES as readonly string[]).includes(value)
  ) {
    return value as EventCategory;
  }
  return null;
}

/**
 * Never throws. Missing / partial / invalid payloads become empty defaults.
 */
export function parseQuotationDocumentContent(
  value: unknown,
): QuotationDocumentContent {
  const defaults = emptyQuotationDocumentContent();
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return defaults;
  }

  const raw = value as Record<string, unknown>;
  const parsed = quotationDocumentContentSchema.safeParse(value);

  if (parsed.success) {
    const data = parsed.data;
    return {
      ...defaults,
      clientMode: data.clientMode === "wedding" ? "wedding" : "corporate",
      contactPerson: data.contactPerson,
      attentionTo: data.attentionTo,
      yourReference: data.yourReference,
      internalReference: data.internalReference ?? null,
      preparedBy: data.preparedBy,
      salesPerson: data.salesPerson ?? null,
      cc: data.cc,
      packageId: data.packageId,
      packageIds: data.packageIds ?? (data.packageId ? [data.packageId] : []),
      validityLabel: data.validityLabel,
      deliveryTerm: data.deliveryTerm,
      paymentTerms: data.paymentTerms,
      termsAndConditions: data.termsAndConditions,
      bankDetails: data.bankDetails,
      paymentReference: data.paymentReference ?? null,
      footer: data.footer,
      eventNotes: data.eventNotes ?? data.event?.notes ?? null,
      billTo: { ...defaults.billTo, ...(data.billTo ?? {}) },
      wedding: { ...defaults.wedding, ...(data.wedding ?? {}) },
      event: {
        ...defaults.event,
        ...(data.event ?? {}),
        category: asEventCategory(data.event?.category),
      },
      pricing: { ...defaults.pricing, ...(data.pricing ?? {}) },
      attachments: (data.attachments ?? []).map((row) => ({
        id: row.id,
        name: row.name ?? null,
        url: row.url ?? null,
        mimeType: row.mimeType ?? null,
      })),
    };
  }

  // Field-by-field recovery for legacy / partial payloads.
  const billTo = quotationBillToSchema.safeParse(raw.billTo ?? {});
  const wedding = quotationWeddingSchema.safeParse(raw.wedding ?? {});
  const event = quotationEventSchema.safeParse(raw.event ?? {});
  const pricing = quotationPricingSchema.safeParse(raw.pricing ?? {});
  const packageId = optionalUuid.safeParse(raw.packageId);

  const pickString = (key: string, max: number): string | null => {
    const result = looseString(max).safeParse(raw[key]);
    return result.success ? result.data : null;
  };

  return {
    ...defaults,
    clientMode: raw.clientMode === "wedding" ? "wedding" : "corporate",
    billTo: billTo.success
      ? { ...defaults.billTo, ...billTo.data }
      : defaults.billTo,
    wedding: wedding.success
      ? { ...defaults.wedding, ...wedding.data }
      : defaults.wedding,
    event: event.success
      ? {
          ...defaults.event,
          ...event.data,
          category: asEventCategory(event.data.category),
        }
      : defaults.event,
    pricing: pricing.success
      ? { ...defaults.pricing, ...pricing.data }
      : defaults.pricing,
    contactPerson: pickString("contactPerson", 200),
    attentionTo: pickString("attentionTo", 200),
    yourReference: pickString("yourReference", 120),
    internalReference: pickString("internalReference", 120),
    preparedBy: pickString("preparedBy", 200),
    salesPerson: pickString("salesPerson", 200),
    cc: pickString("cc", 200),
    packageId: packageId.success ? packageId.data : null,
    packageIds: Array.isArray(raw.packageIds)
      ? raw.packageIds.filter((id): id is string => typeof id === "string")
      : [],
    validityLabel: pickString("validityLabel", 200),
    deliveryTerm: pickString("deliveryTerm", 500),
    paymentTerms: pickString("paymentTerms", 4000),
    termsAndConditions: pickString("termsAndConditions", 8000),
    bankDetails: pickString("bankDetails", 2000),
    paymentReference: pickString("paymentReference", 200),
    footer: pickString("footer", 2000),
    eventNotes: pickString("eventNotes", 8000) ?? pickString("notes", 8000),
    attachments: [],
  };
}

export function formatCompanyBankDetails(input: {
  accountName?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  companyName?: string | null;
  swiftCode?: string | null;
}): string | null {
  const parts = [
    input.companyName?.trim() || input.accountName?.trim(),
    input.bankName?.trim(),
    input.accountName?.trim(),
    input.accountNumber?.trim(),
    input.swiftCode?.trim() ? `SWIFT ${input.swiftCode.trim()}` : null,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(" · ");
}

export function resolveLineItemKind(value: unknown): FinanceLineItemKind {
  const parsed = financeLineItemKindSchema.safeParse(value);
  return parsed.success ? parsed.data : "line";
}

export function eventDayLabelFromDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}
