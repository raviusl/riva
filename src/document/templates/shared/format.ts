/**
 * Presentation-only formatters for document templates.
 * No business logic — display helpers only.
 */

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(value: string | null | undefined): string {
  return value?.trim() || "";
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return "";
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const EVENT_CATEGORY_LABELS: Record<string, string> = {
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

export function formatEventCategory(
  category: string | null | undefined,
): string {
  if (!category) return "";
  return EVENT_CATEGORY_LABELS[category] ?? formatStatus(category);
}

/** Split terms text into numbered list items when possible. */
export function parseTermsLines(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const numbered = trimmed.match(/^\s*\d+[\.\)]\s+/m);
  if (numbered) {
    return trimmed
      .split(/\n+/)
      .map((line) => line.replace(/^\s*\d+[\.\)]\s*/, "").trim())
      .filter(Boolean);
  }

  const bullets = trimmed
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (bullets.length > 1) return bullets;

  const sentences = trimmed
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);

  return sentences.length > 1 ? sentences : [trimmed];
}

/**
 * Render package notes as either a bullet list or pre-wrapped paragraphs.
 */
export function parseDescriptionNotes(notes: string | null | undefined): {
  kind: "list" | "text";
  items: string[];
} | null {
  if (!notes?.trim()) return null;
  const lines = notes
    .split(/\n+/)
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

  const looksLikeList =
    lines.length > 1 ||
    /^[-•*]/.test(notes.trim()) ||
    notes.includes("\n");

  if (looksLikeList && lines.length > 0) {
    return { kind: "list", items: lines };
  }

  return { kind: "text", items: [notes.trim()] };
}
