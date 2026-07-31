"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  buildLoginHref,
  isAuthProtectedPath,
  isAuthPublicPath,
} from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

type AuthSessionState = {
  status: "loading" | "ready";
  userId: string | null;
  expiresAt: number | null;
};

type AuthSessionContextValue = AuthSessionState & {
  isAuthenticated: boolean;
  refreshSession: () => Promise<boolean>;
  signOut: (reason?: "signed_out" | "session_expired") => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

const INITIAL_STATE: AuthSessionState = {
  status: "loading",
  userId: null,
  expiresAt: null,
};

/**
 * Client session provider — listens for auth events + token refresh.
 * Does not change login UI; gates protected client surfaces via status.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<AuthSessionState>(INITIAL_STATE);

  const applySession = useCallback(
    (session: {
      user?: { id: string } | null;
      expires_at?: number | null;
    } | null) => {
      setState({
        status: "ready",
        userId: session?.user?.id ?? null,
        expiresAt: session?.expires_at ?? null,
      });
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        applySession(null);
        return false;
      }
      applySession(data.session);
      return true;
    } catch {
      applySession(null);
      return false;
    }
  }, [applySession]);

  const signOut = useCallback(
    async (reason: "signed_out" | "session_expired" = "signed_out") => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // Still clear local state and redirect.
      }
      applySession(null);
      const next =
        pathname && isAuthProtectedPath(pathname) ? pathname : "/dashboard";
      window.location.assign(buildLoginHref({ next, reason }));
    },
    [applySession, pathname],
  );

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      applySession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      applySession(session);

      if (event === "SIGNED_OUT") {
        const path = window.location.pathname;
        if (isAuthProtectedPath(path) && !isAuthPublicPath(path)) {
          window.location.assign(
            buildLoginHref({
              next: `${path}${window.location.search}`,
              reason: "session_expired",
            }),
          );
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      ...state,
      isAuthenticated: state.userId != null,
      refreshSession,
      signOut,
    }),
    [state, refreshSession, signOut],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession(): AuthSessionContextValue {
  const value = useContext(AuthSessionContext);
  if (!value) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return value;
}

/** Safe hook when provider may be absent (tests / isolated trees). */
export function useAuthSessionOptional(): AuthSessionContextValue | null {
  return useContext(AuthSessionContext);
}
