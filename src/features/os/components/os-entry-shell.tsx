import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { osShellClassName } from "@/features/os/lib/os-ui";

type OsEntryShellProps = {
  children: React.ReactNode;
  showSignOut?: boolean;
};

export function OsEntryShell({
  children,
  showSignOut = true,
}: OsEntryShellProps) {
  return (
    <div className={osShellClassName}>
      <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
        <div className="flex items-center gap-2.5 text-white/50">
          <span className="flex size-7 items-center justify-center rounded-[9px] bg-white text-[11px] font-semibold tracking-tight text-black">
            R
          </span>
          <span className="text-[13px] font-medium tracking-[0.04em]">
            RIVA OS
          </span>
        </div>
      </div>
      {showSignOut ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <SignOutButton />
        </div>
      ) : null}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
