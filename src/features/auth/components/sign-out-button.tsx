"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import { useAuthSessionOptional } from "@/features/auth/components/session-provider";
import { buildLoginHref } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  const authSession = useAuthSessionOptional();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-white/45 hover:bg-white/5 hover:text-white"
      onClick={() => {
        startTransition(async () => {
          try {
            if (authSession) {
              await authSession.signOut("signed_out");
              return;
            }
            const supabase = createClient();
            const { error } = await supabase.auth.signOut({ scope: "global" });
            if (error) {
              toast.error(error.message);
              return;
            }
            // Hard navigation ensures cleared auth cookies apply immediately.
            window.location.assign(
              buildLoginHref({ reason: "signed_out" }),
            );
          } catch (error) {
            const message =
              error instanceof Error ? error.message : uiZh.signOutFailed;
            toast.error(message);
          }
        });
      }}
    >
      {uiZh.signOut}
    </Button>
  );
}
