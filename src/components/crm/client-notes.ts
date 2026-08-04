/**
 * Optional company name is stored in notes without a schema change.
 * Format: first line `Company: …` then optional blank line + body.
 */

import { uiZh } from "@/config/ui-zh";

const COMPANY_PREFIX = "Company:";

export function composeClientNotes(
  companyName: string | null | undefined,
  notes: string | null | undefined,
): string | null {
  const company = companyName?.trim() || "";
  const body = notes?.trim() || "";
  if (company && body) return `${COMPANY_PREFIX} ${company}\n\n${body}`;
  if (company) return `${COMPANY_PREFIX} ${company}`;
  if (body) return body;
  return null;
}

export function parseClientCompanyFromNotes(
  notes: string | null | undefined,
): string | null {
  if (!notes) return null;
  const firstLine = notes.split("\n")[0]?.trim() ?? "";
  if (!firstLine.toLowerCase().startsWith(COMPANY_PREFIX.toLowerCase())) {
    return null;
  }
  const value = firstLine.slice(COMPANY_PREFIX.length).trim();
  return value || null;
}

export function parseClientNotesBody(
  notes: string | null | undefined,
): string | null {
  if (!notes) return null;
  const lines = notes.split("\n");
  const first = lines[0]?.trim() ?? "";
  if (!first.toLowerCase().startsWith(COMPANY_PREFIX.toLowerCase())) {
    return notes.trim() || null;
  }
  const rest = lines.slice(1).join("\n").replace(/^\n+/, "").trim();
  return rest || null;
}

function humanizeEnumValue(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatClientStatus(status: string): string {
  switch (status) {
    case "inquiry":
    case "active":
      return uiZh.weddingStatusInquiry;
    case "follow_up":
      return uiZh.clientStatusFollowUp;
    case "confirmed":
      return uiZh.confirmed;
    case "completed":
      return uiZh.completed;
    case "cancelled":
      return uiZh.cancelled;
    case "archived":
      return uiZh.clientStatusArchived;
    default:
      return humanizeEnumValue(status);
  }
}

export function formatClientUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
