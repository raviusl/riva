import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { uiZh } from "@/config/ui-zh";

type WorkspaceLayoutProps = {
  backHref: string;
  backLabel: string;
  children: ReactNode;
  fallbackLabel?: string;
};

/**
 * Shared page chrome for Project / Client / Vendor workspace routes.
 */
export function WorkspaceLayout({
  backHref,
  backLabel,
  children,
  fallbackLabel = uiZh.loadingWorkspace,
}: WorkspaceLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {backLabel}
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-10 text-sm text-white/45">
            {fallbackLabel}
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
