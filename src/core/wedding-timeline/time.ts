/**
 * Time helpers for wedding timeline (HH:MM).
 */

export function normalizeTime(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function timeToMinutes(value: string | null | undefined): number | null {
  const normalized = normalizeTime(value);
  if (!normalized) return null;
  const [h, m] = normalized.split(":").map(Number);
  return h! * 60 + m!;
}

export function minutesToTime(total: number): string {
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDuration(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const a = timeToMinutes(start);
  const b = timeToMinutes(end);
  if (a == null || b == null) return "—";
  let diff = b - a;
  if (diff < 0) diff += 24 * 60;
  if (diff === 0) return "0m";
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function shiftTime(
  value: string | null | undefined,
  deltaMinutes: number,
): string | null {
  const mins = timeToMinutes(value);
  if (mins == null) return null;
  return minutesToTime(mins + deltaMinutes);
}

export function formatTimeDisplay(value: string | null | undefined): string {
  return normalizeTime(value) ?? "—";
}
