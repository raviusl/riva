"use client";

import type { ReactNode } from "react";

import { Loading } from "@/components/ui/loading";
import { uiZh } from "@/config/ui-zh";
import { useAuthSessionOptional } from "@/features/auth/components/session-provider";

type AuthLoadingGateProps = {
  children: ReactNode;
  /** When true, wait for client session hydration before rendering children. */
  requireReady?: boolean;
  label?: string;
};

/**
 * Auth loading gate for protected layouts.
 * Reuses existing Loading component — no UI redesign.
 */
export function AuthLoadingGate({
  children,
  requireReady = true,
  label = uiZh.checkingSession,
}: AuthLoadingGateProps) {
  const session = useAuthSessionOptional();

  if (requireReady && session?.status === "loading") {
    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center">
        <Loading label={label} fullPage />
      </div>
    );
  }

  return children;
}
