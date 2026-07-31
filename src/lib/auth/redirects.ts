import "server-only";

import { redirect } from "next/navigation";

import {
  buildLoginHref,
  buildUnauthorizedHref,
  type AuthRedirectReason,
} from "@/lib/auth/routes";
import { safeAuthNextPath } from "@/features/auth/lib/auth-ui";

/**
 * Server redirect to login (preserves safe `next` + reason).
 */
export function redirectToLogin(options?: {
  next?: string | null;
  reason?: AuthRedirectReason;
}): never {
  redirect(
    buildLoginHref({
      next: options?.next ? safeAuthNextPath(options.next) : null,
      reason: options?.reason ?? "unauthenticated",
    }),
  );
}

/**
 * Server redirect for authenticated-but-forbidden access.
 */
export function redirectUnauthorized(options?: { from?: string | null }): never {
  redirect(buildUnauthorizedHref({ from: options?.from ?? null }));
}
