"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { OsStage } from "@/features/os/components/os-stage";
import {
  osBodyClassName,
  osDisplayNameClassName,
  osGreetingClassName,
  osPrimaryButtonClassName,
  resolveDayGreeting,
} from "@/features/os/lib/os-ui";
import { OS_BUSINESS_PATH } from "@/lib/os/entry-paths";

type OsWelcomeScreenProps = {
  displayName: string;
};

export function OsWelcomeScreen({ displayName }: OsWelcomeScreenProps) {
  const router = useRouter();
  const greeting = useMemo(() => resolveDayGreeting(), []);
  const name = displayName.trim().split(/\s+/)[0] || "there";

  return (
    <OsStage>
      <div className="space-y-1">
        <p className={osGreetingClassName}>{greeting},</p>
        <h1 className={osDisplayNameClassName}>{name}</h1>
      </div>

      <div className="mt-10 space-y-2">
        <p className="text-[17px] font-medium tracking-tight text-white/80 sm:text-lg">
          Welcome back to RIVA OS.
        </p>
        <p className={osBodyClassName}>Everything starts from one place.</p>
      </div>

      <div className="mt-14 flex justify-center">
        <button
          type="button"
          className={osPrimaryButtonClassName}
          onClick={() => router.push(OS_BUSINESS_PATH)}
        >
          Continue
        </button>
      </div>
    </OsStage>
  );
}
