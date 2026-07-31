import Link from "next/link";

import { AUTH_LOGIN_PATH } from "@/lib/auth/routes";

type PageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const detail =
    params.reason === "missing_code"
      ? "The sign-in link was incomplete."
      : params.reason === "exchange_failed"
        ? "The sign-in link could not be verified or has expired."
        : "We could not complete sign-in.";

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#070708] px-6 text-center text-white">
      <h1 className="text-xl font-semibold tracking-tight">
        Authentication error
      </h1>
      <p className="mt-2 max-w-sm text-sm text-white/45">
        {detail} Please try again or contact support if the problem continues.
      </p>
      <Link
        href={AUTH_LOGIN_PATH}
        className="mt-6 rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.05]"
      >
        Back to sign in
      </Link>
    </main>
  );
}
