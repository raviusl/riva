"use client";

import { useMemo } from "react";

import { uiZh } from "@/config/ui-zh";
import { resolveDayGreeting } from "@/features/os/lib/os-ui";

type WorkspaceGreetingProps = {
  displayName: string;
};

export function WorkspaceGreeting({ displayName }: WorkspaceGreetingProps) {
  const greeting = useMemo(() => resolveDayGreeting(), []);
  const name = displayName.trim().split(/\s+/)[0] || uiZh.greetingGuest;

  return (
    <div className="space-y-1">
      <p className="text-[15px] text-white/40 sm:text-base">{greeting}，</p>
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
        {name}
      </h1>
    </div>
  );
}
