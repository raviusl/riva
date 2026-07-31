/**
 * Authentication foundation surface (Sprint 001 + Sprint 003 + Project 050).
 *
 * Session / guards are server-only — import from:
 * - `@/lib/auth/session`
 * - `@/lib/auth/guards`
 * - `@/lib/auth/redirects`
 * - `@/lib/auth/routes`
 *
 * Existing auth flows remain in `core/auth` and `features/auth`.
 * Middleware session refresh remains in `src/middleware.ts`
 * via `@/lib/supabase/middleware`.
 */
import {
  AUTH_CALLBACK_PATH,
  AUTH_INVITE_ACCEPT_PATH,
  AUTH_LOGIN_PATH,
  AUTH_UPDATE_PASSWORD_PATH,
} from "@/lib/auth/routes";

export const authConfig = {
  loginPath: AUTH_LOGIN_PATH,
  callbackPath: AUTH_CALLBACK_PATH,
  updatePasswordPath: AUTH_UPDATE_PASSWORD_PATH,
  inviteAcceptPath: AUTH_INVITE_ACCEPT_PATH,
} as const;

export {
  AUTH_ROLES,
  AUTH_ROLE_KEYS,
  AUTH_ROLE_DEFINITIONS,
  type AuthRole,
  type AuthRoleKey,
  type AuthRoleDefinition,
} from "./roles";

export {
  AUTH_PERMISSION_ACTIONS,
  AUTH_PERMISSION_RESOURCES,
  type AuthPermissionAction,
  type AuthPermissionResource,
  type AuthPermissionKey,
  type AuthPermissionDefinition,
  type AuthPermissionSet,
} from "./permissions";

export {
  AUTH_LOGIN_PATH,
  AUTH_CALLBACK_PATH,
  AUTH_ERROR_PATH,
  AUTH_UPDATE_PASSWORD_PATH,
  AUTH_INVITE_ACCEPT_PATH,
  AUTH_UNAUTHORIZED_PATH,
  AUTH_ENTER_PATH,
  buildLoginHref,
  buildUnauthorizedHref,
  isAuthProtectedPath,
  isAuthPublicPath,
  isAuthEntryPath,
  type AuthRedirectReason,
} from "./routes";
