/**
 * Strengthen open-redirect protection for auth return paths.
 */

import {
  AUTH_BLOCKED_NEXT_EXACT,
  AUTH_BLOCKED_NEXT_PREFIXES,
  AUTH_UPDATE_PASSWORD_PATH,
  normalizePathname,
} from "@/lib/auth/routes";

/** Shared auth field styling for login / password screens. */
export const authFieldClassName =
  "border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/30";

export const authCardClassName =
  "riva-surface w-full max-w-sm space-y-5 rounded-[var(--riva-radius-lg)] p-6";

export const authPrimaryButtonClassName = "w-full";

const MAX_NEXT_LENGTH = 512;

/**
 * Prevent open redirects after auth. Only same-origin relative paths allowed.
 * Blocks login/auth/invite loops while allowing `/auth/update-password`.
 */
export function safeAuthNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.length > MAX_NEXT_LENGTH) return fallback;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.includes("\\")) return fallback;

  const pathOnly = normalizePathname(trimmed.split("?")[0] ?? trimmed);
  if ((AUTH_BLOCKED_NEXT_EXACT as readonly string[]).includes(pathOnly)) {
    return fallback;
  }
  if (
    AUTH_BLOCKED_NEXT_PREFIXES.some(
      (prefix) =>
        pathOnly === prefix.slice(0, -1) || pathOnly.startsWith(prefix),
    )
  ) {
    return fallback;
  }
  if (
    pathOnly.startsWith("/auth/") &&
    pathOnly !== AUTH_UPDATE_PASSWORD_PATH
  ) {
    return fallback;
  }

  return trimmed;
}

/**
 * Post-login destination. Dashboard deep links go through `/dashboard/enter`
 * so workspace/company context is resolved before the target page.
 */
export function resolvePostLoginHref(
  nextRaw: string | null | undefined,
): string {
  const next = safeAuthNextPath(nextRaw, "/dashboard");

  if (next === AUTH_UPDATE_PASSWORD_PATH) {
    return next;
  }

  if (next === "/dashboard") {
    return "/dashboard/enter";
  }

  if (next.startsWith("/dashboard/")) {
    const params = new URLSearchParams();
    params.set("next", next);
    return `/dashboard/enter?${params.toString()}`;
  }

  return "/dashboard/enter";
}
