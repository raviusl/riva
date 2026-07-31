import "server-only";

import { getSessionUser } from "@/features/auth/lib/get-session-user";
import type { AuthSession, AuthSessionUser } from "@/types/auth/Session";
import { createClient } from "@/lib/supabase/server";

function toAuthSessionUser(user: {
  id: string;
  email?: string | null;
}): AuthSessionUser {
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

/**
 * Returns the current Auth session (user or null).
 * Validates the JWT via getUser (not cookie-only getSession).
 */
export async function getAuthSession(): Promise<AuthSession> {
  const user = await getSessionUser();
  if (!user) {
    return { user: null };
  }
  return { user: toAuthSessionUser(user) };
}

/**
 * Returns the authenticated user id, or null when signed out.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session.user?.id ?? null;
}

/**
 * Server-side access-token refresh. Prefer middleware for cookie writes;
 * safe to call from Route Handlers / Server Actions.
 */
export async function refreshAuthSession(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.refreshSession();
    return !error && Boolean(data.session);
  } catch {
    return false;
  }
}

export type { AuthSession, AuthSessionUser, AuthenticatedSession } from "@/types/auth/Session";
