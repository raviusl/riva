import { Suspense } from "react";
import { notFound } from "next/navigation";

import { DevVerifyClient } from "@/app/dev/verify/dev-verify-client";

/**
 * DEV-ONLY visual verification harness (Projects 068–070).
 * Not available in production.
 */
export default function DevVerifyPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <DevVerifyClient />
    </Suspense>
  );
}
