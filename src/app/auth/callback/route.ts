import { NextResponse } from "next/server";

import { safeAuthNextPath } from "@/features/auth/lib/auth-ui";
import { AUTH_ENTER_PATH, AUTH_ERROR_PATH } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthNextPath(searchParams.get("next"), AUTH_ENTER_PATH);

  if (!code) {
    const errorUrl = new URL(AUTH_ERROR_PATH, origin);
    errorUrl.searchParams.set("reason", "missing_code");
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const errorUrl = new URL(AUTH_ERROR_PATH, origin);
    errorUrl.searchParams.set("reason", "exchange_failed");
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
