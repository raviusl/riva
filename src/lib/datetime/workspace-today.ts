/**
 * Shared calendar day-key for MVP surfaces (Dashboard Focus + Calendar).
 * Canonical SoT: active workspace timezone; empty/invalid → UTC.
 */

const FALLBACK_TIMEZONE = "UTC";

export function resolveWorkspaceTimeZone(
  timeZone: string | null | undefined,
): string {
  const trimmed = timeZone?.trim();
  if (!trimmed) return FALLBACK_TIMEZONE;
  try {
    // Throws RangeError for invalid IANA zones in supported runtimes.
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

/** YYYY-MM-DD in the given workspace timezone. */
export function workspaceTodayKey(
  timeZone: string | null | undefined,
  now: Date = new Date(),
): string {
  const zone = resolveWorkspaceTimeZone(timeZone);
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // en-CA → YYYY-MM-DD
  return formatted;
}

/** Calendar day key for an absolute instant in the workspace timezone. */
export function workspaceDateKeyFromInstant(
  isoOrDate: string | Date,
  timeZone: string | null | undefined,
): string {
  const date =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(date.getTime())) {
    return typeof isoOrDate === "string"
      ? isoOrDate.slice(0, 10)
      : workspaceTodayKey(timeZone);
  }
  return workspaceTodayKey(timeZone, date);
}

export function isSameWorkspaceCalendarDay(
  iso: string,
  timeZone: string | null | undefined,
  now: Date = new Date(),
): boolean {
  return (
    workspaceDateKeyFromInstant(iso, timeZone) ===
    workspaceTodayKey(timeZone, now)
  );
}
