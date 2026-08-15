/**
 * Time helpers for wedding timeline (Project 101 timestamptz + 099 HH:MM compat).
 */

import { resolveWorkspaceTimeZone } from "@/lib/datetime/workspace-today";

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

export function formatDurationMinutes(
  durationMinutes: number | null | undefined,
): string {
  if (durationMinutes == null || Number.isNaN(durationMinutes)) return "—";
  if (durationMinutes === 0) return "0m";
  const h = Math.floor(durationMinutes / 60);
  const m = durationMinutes % 60;
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

/** Duration in minutes from two HH:MM values (overnight-aware). */
export function durationMinutesFromTimes(
  start: string | null | undefined,
  end: string | null | undefined,
): number | null {
  const a = timeToMinutes(start);
  const b = timeToMinutes(end);
  if (a == null || b == null) return null;
  let diff = b - a;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

/** Local HH:MM clock for an instant in the given IANA timezone. */
export function clockTimeFromInstant(
  iso: string | null | undefined,
  timeZone: string | null | undefined,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const zone = resolveWorkspaceTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  if (!hour || !minute) return null;
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/**
 * Build timestamptz ISO from calendar date (YYYY-MM-DD) + HH:MM in zone.
 * Returns null if inputs are incomplete/invalid.
 */
export function instantFromLocalDateAndTime(
  dateKey: string | null | undefined,
  timeHhMm: string | null | undefined,
  timeZone: string | null | undefined,
): string | null {
  const time = normalizeTime(timeHhMm);
  if (!dateKey || !time) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const zone = resolveWorkspaceTimeZone(timeZone);
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // Iterate a UTC guess and correct with zone offset (handles DST).
  let guess = Date.UTC(year!, month! - 1, day!, hour!, minute!, 0);
  for (let i = 0; i < 3; i += 1) {
    const asLocal = clockPartsInZone(new Date(guess), zone);
    const desiredMinutes = hour! * 60 + minute!;
    const actualMinutes = asLocal.hour * 60 + asLocal.minute;
    const dayDelta =
      Date.UTC(year!, month! - 1, day!) -
      Date.UTC(asLocal.year, asLocal.month - 1, asLocal.day);
    const dayMinutes = dayDelta / 60_000;
    const deltaMinutes = desiredMinutes - actualMinutes + dayMinutes;
    if (Math.abs(deltaMinutes) < 0.5) break;
    guess += deltaMinutes * 60_000;
  }
  return new Date(guess).toISOString();
}

function clockPartsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function addMinutesToIso(
  iso: string | null | undefined,
  deltaMinutes: number,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getTime() + deltaMinutes * 60_000).toISOString();
}

export function scheduledEndFromStartAndDuration(
  scheduledStart: string | null | undefined,
  durationMinutes: number | null | undefined,
): string | null {
  if (!scheduledStart || durationMinutes == null) return null;
  return addMinutesToIso(scheduledStart, durationMinutes);
}
