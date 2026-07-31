"use client";

import { useMemo } from "react";

import { uiZh } from "@/config/ui-zh";
import { resolveDayGreeting } from "@/features/os/lib/os-ui";

type CommandCenterGreetingProps = {
  displayName: string;
};

/**
 * Time-aware presence — not a business summary.
 */
export function CommandCenterGreeting({
  displayName,
}: CommandCenterGreetingProps) {
  const greeting = useMemo(() => resolveDayGreeting(), []);
  const name = displayName.trim().split(/\s+/)[0] || uiZh.greetingGuest;

  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-[2.5rem]">
        {greeting}，{name}。
      </h1>
      <p className="text-base tracking-tight text-white/40">{uiZh.welcomeBack}</p>
    </header>
  );
}
