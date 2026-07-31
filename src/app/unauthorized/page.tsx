import Link from "next/link";

import { AUTH_LOGIN_PATH } from "@/lib/auth/routes";

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

/**
 * Unauthorized / forbidden landing (Project 050).
 * Minimal status page — not a login redesign.
 */
export default async function UnauthorizedPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#070708] px-6 text-center text-white">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">
        403
      </p>
      <h1 className="mt-3 text-xl font-semibold tracking-tight">
        Unauthorized
      </h1>
      <p className="mt-2 max-w-sm text-sm text-white/45">
        You are signed in but do not have access to this area.
        {params.from ? (
          <>
            {" "}
            Requested: <span className="text-white/60">{params.from}</span>
          </>
        ) : null}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <Link
          href="/dashboard"
          className="rounded-lg border border-white/10 px-3 py-2 text-white hover:bg-white/[0.05]"
        >
          Back to dashboard
        </Link>
        <Link
          href={AUTH_LOGIN_PATH}
          className="rounded-lg border border-white/10 px-3 py-2 text-white/60 hover:bg-white/[0.05] hover:text-white"
        >
          Sign in again
        </Link>
      </div>
    </main>
  );
}
