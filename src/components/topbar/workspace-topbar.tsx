"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  SearchIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useUniversalSearchOptional } from "@/components/search/universal-search-provider";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uiZh } from "@/config/ui-zh";
import { useAuthSessionOptional } from "@/features/auth/components/session-provider";
import { CompanySwitcher } from "@/features/company/components/company-switcher";
import { NotificationCenterTrigger } from "@/features/notification-center";
import {
  brandIconButtonClassName,
  brandIconSizeClassName,
} from "@/lib/brand-ui";
import { buildLoginHref } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type WorkspaceTopbarProps = {
  workspaceName: string;
  businessName: string;
  userLabel: string;
  userEmail?: string | null;
};

/**
 * Topbar actions only.
 * Workspace / Company / Role context lives in the switcher — not as homepage chrome.
 */
export function WorkspaceTopbar({
  businessName,
  userLabel,
  userEmail = null,
}: WorkspaceTopbarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const authSession = useAuthSessionOptional();
  const universalSearch = useUniversalSearchOptional();

  function openSearch() {
    if (universalSearch) {
      universalSearch.setOpen(true);
      return;
    }
    toast.message(uiZh.searchUnavailable);
  }

  function signOut() {
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
        window.location.assign(buildLoginHref({ reason: "signed_out" }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : uiZh.signOutFailed;
        toast.error(message);
      }
    });
  }

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);

  return (
    <header className="riva-glass flex min-h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 sm:px-6">
      <MobileSidebar businessName={businessName} />

      <div className="min-w-0 flex-1">
        <CompanySwitcher />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(
            brandIconButtonClassName,
            "hidden w-auto gap-2 px-3 text-[13px] text-white/40 sm:inline-flex",
          )}
          aria-label={uiZh.search}
          onClick={openSearch}
        >
          <SearchIcon className={cn(brandIconSizeClassName, "shrink-0")} />
          <span className="hidden md:inline">{uiZh.commandPalette}</span>
          <kbd className="ml-1 hidden rounded border border-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/30 lg:inline">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        </button>

        <button
          type="button"
          className={cn(brandIconButtonClassName, "sm:hidden")}
          aria-label={uiZh.search}
          onClick={openSearch}
        >
          <SearchIcon className={brandIconSizeClassName} />
        </button>

        <NotificationCenterTrigger />

        <button
          type="button"
          className={brandIconButtonClassName}
          aria-label={uiZh.aiAssistant}
          onClick={() => toast.message(uiZh.aiAssistantSoon)}
        >
          <SparklesIcon className={brandIconSizeClassName} />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={pending}
            className={cn(brandIconButtonClassName, "ml-0.5")}
            aria-label={uiZh.userProfile}
          >
            <UserRoundIcon className={brandIconSizeClassName} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-white/[0.08] bg-[#121214]/95 text-white backdrop-blur-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="space-y-0.5 font-normal">
                <p className="truncate text-sm text-white">{userLabel}</p>
                {userEmail ? (
                  <p className="truncate text-xs text-white/40">{userEmail}</p>
                ) : null}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer text-sm"
                onClick={() => router.push("/dashboard/settings/profile")}
              >
                {uiZh.profile}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-sm"
                onClick={() => router.push("/dashboard/settings")}
              >
                {uiZh.settings}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer text-sm text-white/70"
                disabled={pending}
                onClick={signOut}
              >
                {uiZh.signOut}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer text-sm"
                onClick={() => router.push("/dashboard/business")}
              >
                {uiZh.switchBusiness}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
