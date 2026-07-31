import "server-only";

import { CoreError } from "@/core/errors";
import { getAuthSession } from "@/lib/auth/session";
import type { AuthenticatedSession } from "@/types/auth/Session";

/**
 * Authentication guards (Sprint 003 + Project 050).
 * Session presence only — no role / permission / business checks.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return session.user != null;
}

/**
 * Requires a signed-in Auth user.
 * Throws CoreError when unauthenticated. Does not evaluate roles or permissions.
 */
export async function requireAuthenticated(): Promise<AuthenticatedSession> {
  const session = await getAuthSession();
  if (!session.user) {
    throw new CoreError("UNAUTHENTICATED", "You must be signed in.");
  }
  return { user: session.user };
}
