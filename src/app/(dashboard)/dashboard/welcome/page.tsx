import { requireSessionUserId } from "@/core/auth/session";
import { OsEntryShell } from "@/features/os/components/os-entry-shell";
import { OsWelcomeScreen } from "@/features/os/components/os-welcome-screen";
import { createClient } from "@/lib/supabase/server";

async function resolveDisplayName(fallback: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fallback;
  return (
    (typeof user.user_metadata?.display_name === "string" &&
      user.user_metadata.display_name) ||
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    fallback
  );
}

export default async function OsWelcomePage() {
  await requireSessionUserId();
  const displayName = await resolveDisplayName("there");

  return (
    <OsEntryShell>
      <OsWelcomeScreen displayName={displayName} />
    </OsEntryShell>
  );
}
