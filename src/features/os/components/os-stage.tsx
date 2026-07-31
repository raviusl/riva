"use client";

import { cn } from "@/lib/utils";

type OsStageProps = {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
};

/** Fade + slight upward motion for OS entry screens (180–220ms). */
export function OsStage({ children, wide = false, className }: OsStageProps) {
  return (
    <div
      className={cn(
        "os-enter relative z-10 mx-auto w-full text-center",
        wide ? "max-w-2xl" : "max-w-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
