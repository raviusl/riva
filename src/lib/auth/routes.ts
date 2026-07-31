/**
 * Auth route classification (Project 050).
 * Invitation-only — no public signup routes.
 */

export const AUTH_LOGIN_PATH = "/login";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_ERROR_PATH = "/auth/error";
export const AUTH_UPDATE_PASSWORD_PATH = "/auth/update-password";
export const AUTH_INVITE_ACCEPT_PATH = "/invite/accept";
export const AUTH_UNAUTHORIZED_PATH = "/unauthorized";
export const AUTH_ENTER_PATH = "/dashboard/enter";
export const AUTH_WELCOME_PATH = "/dashboard/welcome";

export const AUTH_PUBLIC_EXACT_PATHS = [
  AUTH_LOGIN_PATH,
  AUTH_CALLBACK_PATH,
  AUTH_ERROR_PATH,
  AUTH_INVITE_ACCEPT_PATH,
  AUTH_UNAUTHORIZED_PATH,
] as const;

export const AUTH_PROTECTED_PREFIXES = ["/dashboard"] as const;

export const AUTH_SESSION_REQUIRED_EXACT = [
  AUTH_UPDATE_PASSWORD_PATH,
] as const;

/** Paths that must never be used as post-login `next` targets (open-redirect / loop safety). */
export const AUTH_BLOCKED_NEXT_EXACT = [
  "/",
  AUTH_LOGIN_PATH,
  AUTH_CALLBACK_PATH,
  AUTH_ERROR_PATH,
  AUTH_UNAUTHORIZED_PATH,
] as const;

export const AUTH_BLOCKED_NEXT_PREFIXES = ["/invite/"] as const;

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isAuthPublicPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return (AUTH_PUBLIC_EXACT_PATHS as readonly string[]).includes(path);
}

export function isAuthProtectedPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if ((AUTH_SESSION_REQUIRED_EXACT as readonly string[]).includes(path)) {
    return true;
  }
  return AUTH_PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isAuthEntryPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/" || path === AUTH_LOGIN_PATH;
}

export type AuthRedirectReason =
  | "unauthenticated"
  | "session_expired"
  | "signed_out"
  | "unauthorized";

/**
 * Build `/login` URL with optional return path + reason.
 */
export function buildLoginHref(options?: {
  next?: string | null;
  reason?: AuthRedirectReason;
}): string {
  const params = new URLSearchParams();
  const next = options?.next?.trim();
  if (next && next !== AUTH_LOGIN_PATH) {
    params.set("next", next);
  }
  if (options?.reason) {
    params.set("reason", options.reason);
  }
  const query = params.toString();
  return query ? `${AUTH_LOGIN_PATH}?${query}` : AUTH_LOGIN_PATH;
}

export function buildUnauthorizedHref(options?: { from?: string | null }) {
  const params = new URLSearchParams();
  if (options?.from) {
    params.set("from", options.from);
  }
  const query = params.toString();
  return query ? `${AUTH_UNAUTHORIZED_PATH}?${query}` : AUTH_UNAUTHORIZED_PATH;
}
