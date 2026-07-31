/**
 * Calendar date helpers — view ranges only, not scheduling.
 */

export function toDateKey(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function todayKey(now = new Date()): string {
  return toDateKey(now);
}

export function addDays(key: string, days: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function startOfWeek(key: string): string {
  const date = parseDateKey(key);
  // Monday-start week (zh-CN common)
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

export function startOfMonth(key: string): string {
  const date = parseDateKey(key);
  date.setDate(1);
  return toDateKey(date);
}

export function addMonths(key: string, months: number): string {
  const date = parseDateKey(key);
  date.setMonth(date.getMonth() + months);
  return toDateKey(date);
}

/** 6-week month grid (Mon–Sun), for Month view. */
export function buildMonthGrid(anchorKey: string): string[] {
  const monthStart = startOfMonth(anchorKey);
  const gridStart = startOfWeek(monthStart);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function buildWeekKeys(anchorKey: string): string[] {
  const start = startOfWeek(anchorKey);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatMonthTitle(key: string): string {
  const date = parseDateKey(key);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(date);
}

export function formatDayTitle(key: string): string {
  const date = parseDateKey(key);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function formatWeekTitle(keys: readonly string[]): string {
  if (keys.length === 0) return "";
  const start = parseDateKey(keys[0]!);
  const end = parseDateKey(keys[keys.length - 1]!);
  const fmt = new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
  });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function extractTimeFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  return `${match[1]}:${match[2]}`;
}
