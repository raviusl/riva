"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { toast } from "sonner";

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
import { switchCompanyAction } from "@/core/actions/context-actions";
import { useCompanyContext } from "@/features/company/components/company-context-provider";
import { cn } from "@/lib/utils";

export function CompanySwitcher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { workspaceId, company, companies } = useCompanyContext();

  if (!workspaceId || companies.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={uiZh.selectCompany}
        className="inline-flex h-9 w-full max-w-[200px] items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none hover:bg-white/[0.06] disabled:opacity-50"
        disabled={pending}
      >
        <span className="truncate">
          {company?.name ?? uiZh.selectCompany}
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[220px] border-white/10 bg-[#121214] text-white"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-white/45">
            {uiZh.companies}
          </DropdownMenuLabel>
          {companies.map((item) => {
            const active = item.id === company?.id;
            return (
              <DropdownMenuItem
                key={item.id}
                disabled={pending || active}
                className={cn(
                  "cursor-pointer truncate text-sm",
                  active && "bg-white/[0.08]",
                )}
                onClick={() => {
                  if (active) return;
                  startTransition(async () => {
                    const result = await switchCompanyAction({
                      workspaceId,
                      companyId: item.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(uiZh.switchedTo(item.name));
                    router.refresh();
                  });
                }}
              >
                {item.name}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => router.push("/dashboard/companies/new")}
          >
            {uiZh.createCompany}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => router.push("/dashboard/companies")}
          >
            {uiZh.manageCompanies}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-sm"
            onClick={() => router.push("/dashboard/settings/company")}
          >
            {uiZh.companySettings}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
