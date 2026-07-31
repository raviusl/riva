"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { continueFromDivisionAction } from "@/core/actions/os-actions";
import { OsStage } from "@/features/os/components/os-stage";
import {
  osChoiceCardClassName,
  osChoiceNameClassName,
  osSubtitleClassName,
  osTitleClassName,
} from "@/features/os/lib/os-ui";
import { cn } from "@/lib/utils";

type DivisionOption = { id: string; name: string };

type OsDivisionPickerProps = {
  businessName: string;
  divisions: DivisionOption[];
};

export function OsDivisionPicker({
  businessName,
  divisions,
}: OsDivisionPickerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function continueToWorkspace(divisionId: string) {
    setSelectedId(divisionId);
    startTransition(async () => {
      const result = await continueFromDivisionAction();
      if (!result.ok) {
        setSelectedId(null);
        toast.error(result.error);
        return;
      }
      router.push(result.data.nextPath);
      router.refresh();
    });
  }

  return (
    <OsStage wide>
      <div>
        <h1 className={osTitleClassName}>{businessName}</h1>
        <p className={osSubtitleClassName}>Choose a division to continue.</p>
      </div>

      <ul
        className={cn(
          "mt-12 grid gap-3 text-left",
          divisions.length === 1
            ? "mx-auto max-w-md grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {divisions.map((division, index) => {
          const selected = selectedId === division.id;
          return (
            <li
              key={division.id}
              className="os-enter"
              style={{ animationDelay: `${40 + index * 35}ms` }}
            >
              <button
                type="button"
                disabled={pending}
                data-selected={selected}
                className={osChoiceCardClassName}
                onClick={() => continueToWorkspace(division.id)}
              >
                <span className={osChoiceNameClassName}>{division.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </OsStage>
  );
}
