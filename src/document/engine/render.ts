import "server-only";

import type { ReactElement } from "react";

import { DOCUMENT_A4_CSS } from "@/document/templates/styles/a4";

/**
 * Render a React document tree to a full HTML string with isolated CSS.
 * Uses a dynamic import so `react-dom/server` stays outside the RSC graph.
 */
export async function renderDocumentHtml(
  title: string,
  body: ReactElement,
): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const markup = renderToStaticMarkup(body);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${DOCUMENT_A4_CSS}</style>
</head>
<body>
  <div class="doc-root">${markup}</div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
