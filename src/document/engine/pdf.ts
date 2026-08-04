import "server-only";

import { CoreError } from "@/core/errors";

export type PdfRenderOptions = {
  html: string;
  title?: string;
};

/**
 * Generate an A4 PDF buffer via Playwright Chromium.
 * Automatic pagination + page numbers via Playwright header/footer.
 */
export async function renderHtmlToPdf(
  options: PdfRenderOptions,
): Promise<Buffer> {
  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (error) {
    throw new CoreError(
      "DOCUMENT_PDF_ENGINE_MISSING",
      "Playwright is not available for PDF generation.",
      { cause: error },
    );
  }

  async function launchBrowser() {
    try {
      return await chromium.launch({ headless: true, channel: "chrome" });
    } catch {
      return chromium.launch({ headless: true });
    }
  }

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(options.html, {
      waitUntil: "networkidle",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8px;width:100%;padding:0 14mm;color:#9ca3af;"></div>`,
      footerTemplate: `
        <div style="font-size:8px;width:100%;padding:0 16mm;color:#888888;display:flex;justify-content:space-between;align-items:center;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">
          <span>${escapeHtml(options.title ?? "Document")}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      margin: {
        top: "18mm",
        bottom: "20mm",
        left: "16mm",
        right: "16mm",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
