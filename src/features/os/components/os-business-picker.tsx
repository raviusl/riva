"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { selectBusinessAction } from "@/core/actions/os-actions";
import type { BusinessOption } from "@/core/os/business";
import { OsStage } from "@/features/os/components/os-stage";
import {
  formatCompanyTypeLabel,
  osChoiceCardClassName,
  osChoiceMetaClassName,
  osChoiceNameClassName,
  osSubtitleClassName,
  osTitleClassName,
} from "@/features/os/lib/os-ui";
import { cn } from "@/lib/utils";

type OsBusinessPickerProps = {
  businesses: BusinessOption[];
};

export function OsBusinessPicker({ businesses }: OsBusinessPickerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function selectBusiness(business: BusinessOption) {
    setSelectedId(business.company.id);
    startTransition(async () => {
      const result = await selectBusinessAction({
        workspaceId: business.workspaceId,
        companyId: business.company.id,
      });
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
        <h1 className={osTitleClassName}>Choose Business</h1>
        <p className={osSubtitleClassName}>
          Select where you want to work today.
        </p>
      </div>

      {businesses.length === 0 ? (
        <div className="mt-12 px-2">
          <p className="text-[15px] text-white/45">
            No businesses available yet.
          </p>
          <button
            type="button"
            className="mt-5 text-sm text-white/55 underline-offset-4 transition hover:text-white/80 hover:underline"
            onClick={() => router.push("/dashboard/companies/new")}
          >
            Create a company
          </button>
        </div>
      ) : (
        <ul
          className={cn(
            "mt-12 grid gap-3 text-left",
            businesses.length === 1
              ? "mx-auto max-w-md grid-cols-1"
              : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {businesses.map((business, index) => {
            const description = formatCompanyTypeLabel(business.company.type);
            const selected = selectedId === business.company.id;

            return (
              <li
                key={business.company.id}
                className="os-enter"
                style={{ animationDelay: `${40 + index * 35}ms` }}
              >
                <button
                  type="button"
                  disabled={pending}
                  data-selected={selected}
                  className={osChoiceCardClassName}
                  onClick={() => selectBusiness(business)}
                >
                  <span className={osChoiceNameClassName}>
                    {business.company.name}
                  </span>
                  {description ? (
                    <span className={osChoiceMetaClassName}>{description}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </OsStage>
  );
}
