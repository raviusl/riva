import type { FinanceDocumentPayload } from "@/document/engine/types";
import {
  formatDate,
  formatEventCategory,
  formatMoney,
  formatStatus,
  formatTime,
  parseDescriptionNotes,
  parseTermsLines,
} from "@/document/templates/shared/format";
import {
  DocField,
  DocMetaRow,
  DocSection,
  DocSummaryRow,
  QUOTATION_SECTIONS,
} from "@/document/templates/shared/layout";

function splitFooterNote(note: string): { thanks: string; rest: string } {
  const trimmed = note.trim();
  if (!trimmed) return { thanks: "", rest: "" };

  const lines = trimmed
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 1) {
    return { thanks: lines[0]!, rest: lines.slice(1).join("\n") };
  }

  const sentences =
    trimmed.match(/[^.!?]+[.!?]+(?:\s+|$)/g)?.map((part) => part.trim()) ?? [];
  if (sentences.length > 1) {
    return {
      thanks: sentences[0]!,
      rest: sentences.slice(1).join(" "),
    };
  }

  return { thanks: trimmed, rest: "" };
}

type QuotationDocumentProps = {
  payload: FinanceDocumentPayload;
  /** Future document kinds can disable sections without forking layout. */
  sections?: Partial<typeof QUOTATION_SECTIONS>;
};

/**
 * Premium corporate Quotation PDF — presentation only.
 * Consumes structured FinanceDocumentPayload; never hardcodes business data.
 */
export function QuotationDocument({
  payload,
  sections: sectionOverrides,
}: QuotationDocumentProps) {
  const sections = { ...QUOTATION_SECTIONS, ...sectionOverrides };
  const logoUrl = payload.company.logoUrl || payload.workspace.logoUrl;
  const { quotation, client, lineItems, money, content, company } = payload;
  const billTo = content.billTo;
  const event = content.event;
  const wedding = content.wedding;

  const eventTime = [formatTime(event.startTime), formatTime(event.endTime)]
    .filter(Boolean)
    .join(" – ");

  const coupleName =
    content.clientMode === "wedding"
      ? wedding.coupleDisplayName ||
        [wedding.brideName, wedding.groomName].filter(Boolean).join(" & ")
      : "";

  const hasEvent =
    Boolean(event.title) ||
    Boolean(event.venue) ||
    Boolean(event.venueAddress) ||
    Boolean(event.location) ||
    Boolean(event.date) ||
    Boolean(eventTime) ||
    event.guestCount != null ||
    Boolean(event.dressCode) ||
    Boolean(event.category);

  const hasBillTo =
    Boolean(billTo?.name || client?.name) ||
    Boolean(billTo?.registrationNo) ||
    Boolean(quotation.attentionTo) ||
    Boolean(quotation.contactPerson) ||
    Boolean(billTo?.phone || client?.phone) ||
    Boolean(billTo?.email || client?.email) ||
    Boolean(billTo?.address) ||
    Boolean(coupleName);

  const bankName = company.bankName;
  const accountName = company.bankAccountName;
  const accountNumber = company.bankAccountNumber;
  const hasStructuredBank =
    Boolean(company.name) ||
    Boolean(bankName) ||
    Boolean(accountName) ||
    Boolean(accountNumber) ||
    Boolean(quotation.paymentReference);

  const hasPayment =
    hasStructuredBank || Boolean(quotation.bankDetails?.trim());

  const termsLines = quotation.termsAndConditions
    ? parseTermsLines(quotation.termsAndConditions)
    : [];

  const footerParts = splitFooterNote(payload.footerNote);

  return (
    <>
      {/* —— Header —— */}
      <header className="doc-header">
        <div className="doc-brand">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="doc-logo" src={logoUrl} alt="" />
          ) : null}
          <div>
            <p className="doc-company-name">{company.name}</p>
            {company.registrationNo ? (
              <p className="doc-company-meta">{company.registrationNo}</p>
            ) : null}
            {company.address ? (
              <p className="doc-company-meta">{company.address}</p>
            ) : null}
            {company.phone ? (
              <p className="doc-company-meta">{company.phone}</p>
            ) : null}
            {company.email ? (
              <p className="doc-company-meta">{company.email}</p>
            ) : null}
            {company.website ? (
              <p className="doc-company-meta">{company.website}</p>
            ) : null}
          </div>
        </div>

        <div className="doc-title-block">
          <h1 className="doc-title">Quotation</h1>
          <div className="doc-meta-list">
            <DocMetaRow label="Number" value={quotation.referenceNumber} />
            <DocMetaRow
              label="Issue Date"
              value={formatDate(quotation.issuedAt)}
            />
            <DocMetaRow
              label="Valid Until"
              value={formatDate(quotation.dueAt)}
            />
            <DocMetaRow label="Prepared By" value={quotation.preparedBy} />
            <DocMetaRow label="Currency" value={money.currency} />
            {quotation.yourReference ? (
              <DocMetaRow label="Your Ref" value={quotation.yourReference} />
            ) : null}
            {quotation.salesPerson ? (
              <DocMetaRow label="Sales" value={quotation.salesPerson} />
            ) : null}
          </div>
          {quotation.status ? (
            <div className="doc-status">{formatStatus(quotation.status)}</div>
          ) : null}
        </div>
      </header>

      {/* —— Bill To + Event —— */}
      {(sections.billTo && hasBillTo) || (sections.event && hasEvent) ? (
        <div className="doc-two-col">
          {sections.billTo && hasBillTo ? (
            <DocSection title="Bill To" card>
              <DocField
                label="Company"
                value={billTo?.name || client?.name}
                strong
              />
              <DocField
                label="Registration No."
                value={billTo?.registrationNo}
              />
              {coupleName ? (
                <DocField label="Couple" value={coupleName} strong />
              ) : null}
              <DocField label="Attention To" value={quotation.attentionTo} />
              <DocField label="Contact Person" value={quotation.contactPerson} />
              <DocField
                label="Phone"
                value={billTo?.phone || client?.phone}
              />
              <DocField
                label="Email"
                value={billTo?.email || client?.email}
              />
              <DocField label="Billing Address" value={billTo?.address} />
            </DocSection>
          ) : (
            <div />
          )}

          {sections.event && hasEvent ? (
            <DocSection title="Event Information" card>
              <DocField label="Event Title" value={event.title} strong />
              <DocField
                label="Category"
                value={formatEventCategory(event.category ?? null)}
              />
              <DocField label="Venue" value={event.venue} />
              <DocField
                label="Venue Address"
                value={event.venueAddress || event.location}
              />
              <DocField label="Event Date" value={formatDate(event.date)} />
              <DocField label="Day" value={event.dayLabel} />
              <DocField label="Time" value={eventTime || null} />
              <DocField
                label="Expected Guests"
                value={
                  event.guestCount != null ? String(event.guestCount) : null
                }
              />
              <DocField label="Dress Code" value={event.dressCode} />
            </DocSection>
          ) : null}
        </div>
      ) : null}

      {/* —— Package / line items —— */}
      {sections.lineItems ? (
        <DocSection title="Packages & Services">
          <table className="doc-table">
            <thead>
              <tr>
                <th style={{ width: "4%" }}>#</th>
                <th>Description</th>
                <th className="center" style={{ width: "7%" }}>
                  Qty
                </th>
                <th className="center" style={{ width: "8%" }}>
                  Unit
                </th>
                <th className="num" style={{ width: "13%" }}>
                  Unit Price
                </th>
                <th className="num" style={{ width: "11%" }}>
                  Discount
                </th>
                <th className="num" style={{ width: "11%" }}>
                  Tax
                </th>
                <th className="num" style={{ width: "13%" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ color: "#888888" }}>
                    —
                  </td>
                </tr>
              ) : (
                lineItems.map((item) => {
                  const notes = parseDescriptionNotes(item.notes);
                  return (
                    <tr key={`${item.position}-${item.description}`}>
                      <td className="idx">{item.position + 1}</td>
                      <td>
                        <p className="doc-item-title">{item.description}</p>
                        {notes ? (
                          <div className="doc-item-notes">
                            {notes.kind === "list" ? (
                              <ul>
                                {notes.items.map((line, index) => (
                                  <li key={`${item.position}-note-${index}`}>
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>{notes.items[0]}</p>
                            )}
                          </div>
                        ) : null}
                      </td>
                      <td className="center">{item.quantity}</td>
                      <td className="center">
                        {item.unitOfMeasure || "—"}
                      </td>
                      <td className="num">
                        {formatMoney(item.unitPrice, money.currency)}
                      </td>
                      <td className="num">
                        {item.discount > 0
                          ? formatMoney(item.discount, money.currency)
                          : "—"}
                      </td>
                      <td className="num">
                        {item.tax > 0
                          ? formatMoney(item.tax, money.currency)
                          : "—"}
                      </td>
                      <td className="num">
                        {formatMoney(item.amount, money.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </DocSection>
      ) : null}

      {/* —— Pricing summary —— */}
      {sections.summary ? (
        <div className="doc-summary-wrap">
          <div className="doc-summary">
            <DocSummaryRow
              label="Subtotal"
              value={formatMoney(money.subtotal, money.currency)}
            />
            {money.discount > 0 ? (
              <DocSummaryRow
                label="Discount"
                value={formatMoney(money.discount, money.currency)}
              />
            ) : null}
            {money.tax > 0 ? (
              <DocSummaryRow
                label="Tax"
                value={formatMoney(money.tax, money.currency)}
              />
            ) : null}
            {money.deposit != null && money.deposit > 0 ? (
              <DocSummaryRow
                label="Deposit"
                value={formatMoney(money.deposit, money.currency)}
              />
            ) : null}
            {money.balance != null ? (
              <DocSummaryRow
                label="Balance"
                value={formatMoney(money.balance, money.currency)}
              />
            ) : null}
            <DocSummaryRow
              label="Grand Total"
              value={formatMoney(money.total, money.currency)}
              grand
            />
          </div>
        </div>
      ) : null}

      {/* —— Event notes —— */}
      {sections.eventNotes && quotation.eventNotes?.trim() ? (
        <DocSection title="Event Notes" card>
          <p className="doc-block-body">{quotation.eventNotes}</p>
        </DocSection>
      ) : null}

      {/* —— Payment —— */}
      {sections.payment && hasPayment ? (
        <DocSection title="Payment Details" card>
          {hasStructuredBank &&
          (bankName || accountName || accountNumber || company.name) ? (
            <div className="doc-payment-grid">
              <DocField label="Company Name" value={company.name} strong />
              <DocField label="Bank Name" value={bankName} />
              <DocField label="Account Name" value={accountName} />
              <DocField label="Account Number" value={accountNumber} />
              <DocField
                label="Reference"
                value={quotation.paymentReference}
              />
              {company.swiftCode ? (
                <DocField label="SWIFT" value={company.swiftCode} />
              ) : null}
            </div>
          ) : quotation.bankDetails ? (
            <>
              <p className="doc-block-body">{quotation.bankDetails}</p>
              {quotation.paymentReference ? (
                <DocField
                  label="Reference"
                  value={quotation.paymentReference}
                />
              ) : null}
            </>
          ) : null}
        </DocSection>
      ) : null}

      {/* —— Terms —— */}
      {sections.terms && termsLines.length > 0 ? (
        <DocSection title="Terms & Conditions">
          <ol className="doc-terms">
            {termsLines.map((line, index) => (
              <li key={`term-${index}`}>{line}</li>
            ))}
          </ol>
        </DocSection>
      ) : null}

      {/* —— Remarks (printed notes only; internal notes stay in ERP) —— */}
      {sections.remarks && payload.remarks?.trim() ? (
        <DocSection title="Remarks" card>
          <p className="doc-block-body">{payload.remarks}</p>
        </DocSection>
      ) : null}

      {/* —— Footer —— */}
      <footer className="doc-footer">
        {footerParts.thanks ? (
          <p className="doc-footer-thanks">{footerParts.thanks}</p>
        ) : null}
        {footerParts.rest ? (
          <p className="doc-footer-note">{footerParts.rest}</p>
        ) : null}
      </footer>
    </>
  );
}
