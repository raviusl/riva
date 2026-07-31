import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_ENTER_PATH,
  AUTH_LOGIN_PATH,
  buildLoginHref,
  isAuthEntryPath,
  isAuthProtectedPath,
  isAuthPublicPath,
} from "@/lib/auth/routes";
import { safeAuthNextPath } from "@/features/auth/lib/auth-ui";
import type { Database } from "@/types/database";

/** Refresh when access token expires within this window (seconds). */
const REFRESH_SKEW_SECONDS = 90;

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseAnonKey };
}

function buildRedirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return url;
}

function nextWithPathname(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware session refresh + coarse route protection (Project 050).
 * Uses Supabase SSR cookie refresh; proactively refreshes near expiry.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const returnPath = `${pathname}${request.nextUrl.search}`;
  let supabaseResponse = nextWithPathname(request, pathname);

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  let user: { id: string } | null = null;

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = nextWithPathname(request, pathname);
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    // Proactive token refresh when the access token is near expiry.
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (session?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at - now <= REFRESH_SKEW_SECONDS) {
        await supabase.auth.refreshSession();
      }
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      user = null;
    } else {
      user = data.user;
    }
  } catch {
    // Never crash the app if Supabase auth is temporarily unreachable.
    user = null;
  }

  if (!user && isAuthProtectedPath(pathname)) {
    const loginUrl = buildRedirect(request, AUTH_LOGIN_PATH);
    const href = buildLoginHref({
      next: safeAuthNextPath(returnPath),
      reason: "unauthenticated",
    });
    const parsed = new URL(href, request.nextUrl.origin);
    loginUrl.search = parsed.search;
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthEntryPath(pathname)) {
    const url = buildRedirect(request, AUTH_ENTER_PATH);
    return NextResponse.redirect(url);
  }

  if (!user && pathname === "/" && !isAuthPublicPath(pathname)) {
    const loginUrl = buildRedirect(request, AUTH_LOGIN_PATH);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
