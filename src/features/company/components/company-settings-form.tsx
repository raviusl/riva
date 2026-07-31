"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiZh } from "@/config/ui-zh";
import {
  archiveCompanyAction,
  reactivateCompanyAction,
  restoreCompanyAction,
  suspendCompanyAction,
  updateCompanySettingsAction,
} from "@/core/actions/company-actions";
import {
  COMPANY_TYPES,
  type Company,
  type CompanyType,
} from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  agency: uiZh.companyTypeAgency,
  brand: uiZh.companyTypeBrand,
  venue: uiZh.companyTypeVenue,
  corporate: uiZh.companyTypeCorporate,
  wedding: uiZh.companyTypeWedding,
  other: uiZh.companyTypeOther,
};

const COMPANY_STATUS_LABELS: Record<Company["status"], string> = {
  active: uiZh.active,
  suspended: uiZh.suspended,
  archived: uiZh.archived,
};

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string().min(1, uiZh.companyNameRequired).max(160),
  type: z.enum(COMPANY_TYPES).optional().nullable(),
  logoUrl: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  currency: z.string().max(3).optional(),
  country: z.string().max(2).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CompanySettingsFormProps = {
  company: Company;
  canWrite: boolean;
};

export function CompanySettingsForm({
  company,
  canWrite,
}: CompanySettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const archived = company.status === "archived";
  const editable = canWrite && !archived;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: company.workspace_id,
      companyId: company.id,
      name: company.name,
      type: company.type ?? "agency",
      logoUrl: company.logo_url ?? "",
      timezone: company.timezone ?? "",
      locale: company.locale ?? "",
      currency: company.currency ?? "",
      country: company.country ?? "",
    },
  });

  return (
    <div className="space-y-8">
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const country = values.country?.trim().toUpperCase();
            const logoUrl = values.logoUrl?.trim();
            const currency = values.currency?.trim().toUpperCase();
            const result = await updateCompanySettingsAction({
              workspaceId: values.workspaceId,
              companyId: values.companyId,
              name: values.name,
              type: values.type ?? null,
              logoUrl: logoUrl || null,
              country: country || null,
              timezone: values.timezone?.trim() || null,
              locale: values.locale?.trim() || null,
              currency: currency || null,
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.companyUpdated);
            router.refresh();
          });
        })}
      >
        <input type="hidden" {...form.register("workspaceId")} />
        <input type="hidden" {...form.register("companyId")} />

        <div className="space-y-2">
          <Label htmlFor="company-settings-name">{uiZh.name}</Label>
          <Input
            id="company-settings-name"
            className={authFieldClassName}
            disabled={!editable || pending}
            {...form.register("name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-settings-slug">{uiZh.slug}</Label>
          <Input
            id="company-settings-slug"
            className={authFieldClassName}
            value={company.slug}
            disabled
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-settings-type">{uiZh.type}</Label>
          <select
            id="company-settings-type"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white disabled:opacity-50"
            disabled={!editable || pending}
            {...form.register("type")}
          >
            {COMPANY_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#121214]">
                {COMPANY_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-settings-logo">{uiZh.logoUrl}</Label>
          <Input
            id="company-settings-logo"
            className={authFieldClassName}
            placeholder={uiZh.httpsPlaceholder}
            disabled={!editable || pending}
            {...form.register("logoUrl")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-settings-timezone">{uiZh.timezone}</Label>
            <Input
              id="company-settings-timezone"
              className={authFieldClassName}
              disabled={!editable || pending}
              {...form.register("timezone")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-settings-locale">{uiZh.locale}</Label>
            <Input
              id="company-settings-locale"
              className={authFieldClassName}
              disabled={!editable || pending}
              {...form.register("locale")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-settings-currency">{uiZh.currency}</Label>
            <Input
              id="company-settings-currency"
              className={authFieldClassName}
              maxLength={3}
              disabled={!editable || pending}
              {...form.register("currency")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-settings-country">{uiZh.countryIso}</Label>
            <Input
              id="company-settings-country"
              className={authFieldClassName}
              maxLength={2}
              disabled={!editable || pending}
              {...form.register("country")}
            />
          </div>
        </div>

        {canWrite ? (
          <Button
            type="submit"
            disabled={!editable || pending}
            className="bg-white text-black hover:bg-white/90"
          >
            {pending ? uiZh.saving : uiZh.saveChanges}
          </Button>
        ) : (
          <p className="text-xs text-white/45">
            {uiZh.noPermissionEditCompany}
          </p>
        )}
      </form>

      {canWrite ? (
        <div className="space-y-3 border-t border-white/[0.08] pt-6">
          <p className="text-sm text-white/70">{uiZh.status}</p>
          <p className="text-xs text-white/40">
            {uiZh.currentStatus(COMPANY_STATUS_LABELS[company.status])}
            {uiZh.companyStatusHint}
          </p>
          <div className="flex flex-wrap gap-2">
            {company.status === "active" ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await suspendCompanyAction({
                      workspaceId: company.workspace_id,
                      companyId: company.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(uiZh.companySuspended);
                    router.refresh();
                  });
                }}
              >
                {uiZh.suspend}
              </Button>
            ) : null}
            {company.status === "suspended" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await reactivateCompanyAction({
                        workspaceId: company.workspace_id,
                        companyId: company.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.companyReactivated);
                      router.refresh();
                    });
                  }}
                >
                  {uiZh.reactivate}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await archiveCompanyAction({
                        workspaceId: company.workspace_id,
                        companyId: company.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.companyArchived);
                      router.refresh();
                    });
                  }}
                >
                  {uiZh.archive}
                </Button>
              </>
            ) : null}
            {company.status === "archived" ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await restoreCompanyAction({
                      workspaceId: company.workspace_id,
                      companyId: company.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(uiZh.companyRestored);
                    router.refresh();
                  });
                }}
              >
                {uiZh.restore}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
