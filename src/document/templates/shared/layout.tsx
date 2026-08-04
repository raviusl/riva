import type { ReactNode } from "react";

/** Optional section visibility — future document kinds toggle these. */
export type DocumentLayoutSections = {
  billTo?: boolean;
  event?: boolean;
  lineItems?: boolean;
  summary?: boolean;
  eventNotes?: boolean;
  payment?: boolean;
  terms?: boolean;
  remarks?: boolean;
};

export const QUOTATION_SECTIONS: Required<DocumentLayoutSections> = {
  billTo: true,
  event: true,
  lineItems: true,
  summary: true,
  eventNotes: true,
  payment: true,
  terms: true,
  remarks: true,
};

type MetaRowProps = {
  label: string;
  value: string | null | undefined;
};

export function DocMetaRow({ label, value }: MetaRowProps) {
  if (!value?.trim()) return null;
  return (
    <div className="doc-meta-row">
      <span className="doc-meta-label">{label}</span>
      <span className="doc-meta-value">{value}</span>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string | number | null | undefined;
  strong?: boolean;
};

export function DocField({ label, value, strong }: FieldProps) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <p className="doc-field">
      <span className="doc-field-label">{label}</span>
      <span className={`doc-field-value${strong ? " strong" : ""}`}>
        {value}
      </span>
    </p>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
  card?: boolean;
};

export function DocSection({ title, children, card = false }: SectionProps) {
  return (
    <section className="doc-section">
      <h2 className="doc-section-title">{title}</h2>
      {card ? <div className="doc-card">{children}</div> : children}
    </section>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  grand?: boolean;
};

export function DocSummaryRow({ label, value, grand }: SummaryRowProps) {
  return (
    <div className={`doc-summary-row${grand ? " grand" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
