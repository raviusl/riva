/**
 * Document Engine template CSS — isolated from app chrome.
 * Premium corporate A4 presentation shared by Quotation and future
 * Invoice / Receipt / PO / Contract templates.
 */

export const DOCUMENT_A4_CSS = `
  @page {
    size: A4;
    margin: 18mm 16mm 20mm 16mm;
  }

  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    color: #111111;
    background: #ffffff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10.5px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .doc-root {
    width: 100%;
    max-width: 100%;
  }

  /* —— Header —— */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 32px;
    padding-bottom: 22px;
    margin-bottom: 28px;
    border-bottom: 1.5px solid #111111;
  }

  .doc-brand {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    max-width: 58%;
  }

  .doc-logo {
    max-height: 52px;
    max-width: 120px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .doc-company-name {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0 0 4px;
    color: #111111;
  }

  .doc-company-meta {
    margin: 0;
    color: #555555;
    font-size: 10px;
    line-height: 1.55;
  }

  .doc-company-meta + .doc-company-meta {
    margin-top: 1px;
  }

  .doc-title-block {
    text-align: right;
    flex-shrink: 0;
    min-width: 180px;
  }

  .doc-title {
    margin: 0 0 12px;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    line-height: 1;
    color: #111111;
  }

  .doc-meta-list {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .doc-meta-row {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 12px;
  }

  .doc-meta-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #888888;
    white-space: nowrap;
  }

  .doc-meta-value {
    font-size: 10.5px;
    font-weight: 500;
    color: #111111;
    text-align: right;
    max-width: 160px;
  }

  .doc-status {
    display: inline-block;
    margin-top: 10px;
    padding: 3px 8px;
    border: 1px solid #111111;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* —— Section cards —— */
  .doc-section {
    margin-bottom: 26px;
    page-break-inside: avoid;
  }

  .doc-section-title {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #111111;
  }

  .doc-card {
    border: 1px solid #e2e2e2;
    padding: 14px 16px;
    background: #fafafa;
  }

  .doc-card-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 28px;
  }

  .doc-field {
    margin: 0 0 6px;
  }

  .doc-field:last-child {
    margin-bottom: 0;
  }

  .doc-field-label {
    display: block;
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #888888;
    margin-bottom: 1px;
  }

  .doc-field-value {
    font-size: 10.5px;
    color: #111111;
    white-space: pre-wrap;
  }

  .doc-field-value.strong {
    font-weight: 700;
    font-size: 12px;
  }

  .doc-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 26px;
  }

  /* —— Intro —— */
  .doc-intro {
    margin: 0 0 14px;
    color: #444444;
    font-size: 10.5px;
  }

  /* —— Line items table —— */
  table.doc-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 8px;
  }

  table.doc-table thead th {
    padding: 9px 8px;
    text-align: left;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #111111;
    border-top: 1.5px solid #111111;
    border-bottom: 1.5px solid #111111;
    background: #ffffff;
  }

  table.doc-table thead th.num {
    text-align: right;
  }

  table.doc-table thead th.center {
    text-align: center;
  }

  table.doc-table tbody td {
    padding: 12px 8px;
    vertical-align: top;
    border-bottom: 1px solid #e8e8e8;
    font-size: 10.5px;
    color: #111111;
  }

  table.doc-table tbody td.num {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  table.doc-table tbody td.center {
    text-align: center;
  }

  table.doc-table tbody td.idx {
    color: #888888;
    font-size: 10px;
    width: 28px;
  }

  .doc-item-title {
    font-weight: 600;
    margin: 0 0 4px;
  }

  .doc-item-notes {
    margin: 0;
    color: #555555;
    font-size: 10px;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  .doc-item-notes ul {
    margin: 4px 0 0;
    padding-left: 14px;
  }

  .doc-item-notes li {
    margin: 0 0 2px;
  }

  tr {
    page-break-inside: avoid;
  }

  /* —— Summary —— */
  .doc-summary-wrap {
    display: flex;
    justify-content: flex-end;
    margin: 8px 0 28px;
  }

  .doc-summary {
    width: 280px;
    border: 1px solid #e2e2e2;
    padding: 14px 16px;
    background: #fafafa;
  }

  .doc-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    padding: 5px 0;
    font-size: 10.5px;
  }

  .doc-summary-row span {
    color: #555555;
  }

  .doc-summary-row strong {
    font-weight: 600;
    color: #111111;
    font-variant-numeric: tabular-nums;
  }

  .doc-summary-row.grand {
    margin-top: 8px;
    padding-top: 10px;
    border-top: 1.5px solid #111111;
  }

  .doc-summary-row.grand span {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #111111;
  }

  .doc-summary-row.grand strong {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  /* —— Text blocks —— */
  .doc-block {
    margin-bottom: 22px;
    page-break-inside: avoid;
  }

  .doc-block-body {
    margin: 0;
    white-space: pre-wrap;
    color: #333333;
    font-size: 10.5px;
    line-height: 1.6;
  }

  .doc-terms {
    margin: 0;
    padding-left: 18px;
    color: #333333;
    font-size: 10.5px;
    line-height: 1.65;
  }

  .doc-terms li {
    margin: 0 0 6px;
    padding-left: 4px;
  }

  .doc-terms li:last-child {
    margin-bottom: 0;
  }

  .doc-payment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 24px;
  }

  .doc-qr-slot {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px dashed #d4d4d4;
    color: #aaaaaa;
    font-size: 9px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* —— Footer —— */
  .doc-footer {
    margin-top: 36px;
    padding-top: 14px;
    border-top: 1px solid #e2e2e2;
  }

  .doc-footer-thanks {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 600;
    color: #111111;
  }

  .doc-footer-note {
    margin: 0;
    color: #777777;
    font-size: 9px;
    line-height: 1.55;
    white-space: pre-wrap;
  }
`;
