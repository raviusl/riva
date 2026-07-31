"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { uiZh } from "@/config/ui-zh";
import { switchCompanyAction } from "@/core/actions/context-actions";
import type { Company, CompanyType } from "@/core/types";
import { cn } from "@/lib/utils";

type CompanyListItemProps = {
  workspaceId: string;
  company: Company;
  active: boolean;
};

const COMPANY_STATUS_LABELS: Record<Company["status"], string> = {
  active: uiZh.active,
  suspended: uiZh.suspended,
  archived: uiZh.archived,
};

const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  agency: uiZh.companyTypeAgency,
  brand: uiZh.companyTypeBrand,
  venue: uiZh.companyTypeVenue,
  corporate: uiZh.companyTypeCorporate,
  wedding: uiZh.companyTypeWedding,
  other: uiZh.companyTypeOther,
};

function statusLabel(status: Company["status"]) {
  return COMPANY_STATUS_LABELS[status];
}

function typeLabel(type: CompanyType) {
  return COMPANY_TYPE_LABELS[type];
}

export function CompanyListItem({
  workspaceId,
  company,
  active,
}: CompanyListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || active}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors",
        active
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]",
        pending && "opacity-60",
      )}
      onClick={() => {
        if (active) return;
        startTransition(async () => {
          const result = await switchCompanyAction({
            workspaceId,
            companyId: company.id,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.switchedTo(company.name));
          router.refresh();
        });
      }}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{company.name}</p>
        <p className="mt-1 truncate text-xs text-white/45">
          {company.slug}
          {company.type ? ` · ${typeLabel(company.type)}` : ""} ·{" "}
          {statusLabel(company.status)}
        </p>
      </div>
      {active ? (
        <span className="shrink-0 text-xs text-white/50">{uiZh.active}</span>
      ) : null}
    </button>
  );
}
