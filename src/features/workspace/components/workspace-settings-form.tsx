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
  archiveWorkspaceAction,
  restoreWorkspaceAction,
  suspendWorkspaceAction,
  updateWorkspaceSettingsAction,
} from "@/core/actions/workspace-actions";
import type { Workspace } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const WORKSPACE_STATUS_LABELS: Record<Workspace["status"], string> = {
  pending: uiZh.pending,
  active: uiZh.active,
  suspended: uiZh.suspended,
  archived: uiZh.archived,
};

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, uiZh.workspaceNameRequired).max(120),
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  country: z.string().max(2).optional(),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type WorkspaceSettingsFormProps = {
  workspace: Workspace;
  canWrite: boolean;
};

export function WorkspaceSettingsForm({
  workspace,
  canWrite,
}: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const archived = workspace.status === "archived";
  const editable = canWrite && !archived;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: workspace.id,
      name: workspace.name,
      timezone: workspace.timezone,
      locale: workspace.locale,
      currency: workspace.currency,
      country: workspace.country ?? "",
      logoUrl: workspace.logo_url ?? "",
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
            const result = await updateWorkspaceSettingsAction({
              workspaceId: values.workspaceId,
              name: values.name,
              timezone: values.timezone,
              locale: values.locale,
              currency: values.currency.toUpperCase(),
              country: country || null,
              logoUrl: logoUrl || null,
            });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(uiZh.workspaceUpdated);
            router.refresh();
          });
        })}
      >
        <input type="hidden" {...form.register("workspaceId")} />

        <div className="space-y-2">
          <Label htmlFor="settings-name">{uiZh.name}</Label>
          <Input
            id="settings-name"
            className={authFieldClassName}
            disabled={!editable || pending}
            {...form.register("name")}
          />
          {form.formState.errors.name ? (
            <p className="text-xs text-red-400">
              {form.formState.errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-slug">{uiZh.slug}</Label>
          <Input
            id="settings-slug"
            className={authFieldClassName}
            value={workspace.slug}
            disabled
            readOnly
          />
          <p className="text-xs text-white/35">{uiZh.slugImmutable}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-logo">{uiZh.logoUrl}</Label>
          <Input
            id="settings-logo"
            className={authFieldClassName}
            placeholder={uiZh.httpsPlaceholder}
            disabled={!editable || pending}
            {...form.register("logoUrl")}
          />
          <p className="text-xs text-white/35">{uiZh.logoUrlHint}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="settings-timezone">{uiZh.timezone}</Label>
            <Input
              id="settings-timezone"
              className={authFieldClassName}
              disabled={!editable || pending}
              {...form.register("timezone")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-locale">{uiZh.locale}</Label>
            <Input
              id="settings-locale"
              className={authFieldClassName}
              disabled={!editable || pending}
              {...form.register("locale")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-currency">{uiZh.currency}</Label>
            <Input
              id="settings-currency"
              className={authFieldClassName}
              maxLength={3}
              disabled={!editable || pending}
              {...form.register("currency")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-country">{uiZh.countryIso}</Label>
            <Input
              id="settings-country"
              className={authFieldClassName}
              maxLength={2}
              placeholder={uiZh.placeholderCountry}
              disabled={!editable || pending}
              {...form.register("country")}
            />
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-white/10 px-4 py-3">
          <p className="text-sm text-white/70">{uiZh.customDomain}</p>
          <p className="mt-1 text-xs text-white/40">
            {uiZh.customDomainHint}{" "}
            {workspace.custom_domain
              ? uiZh.currentDomain(workspace.custom_domain)
              : uiZh.notConfigured}
          </p>
        </div>

        {editable ? (
          <Button
            type="submit"
            disabled={pending}
            className="bg-white text-black hover:bg-white/90"
          >
            {pending ? uiZh.saving : uiZh.saveSettings}
          </Button>
        ) : null}
      </form>

      {canWrite ? (
        <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
          <p className="text-sm font-medium text-white">
            {uiZh.workspaceStatus}
          </p>
          <p className="text-xs text-white/45">
            {uiZh.currentStatus(WORKSPACE_STATUS_LABELS[workspace.status])}
            {uiZh.workspacesNeverDeleted}
          </p>
          <div className="flex flex-wrap gap-2">
            {archived ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                className="border-white/15 text-white"
                onClick={() => {
                  startTransition(async () => {
                    const result = await restoreWorkspaceAction({
                      workspaceId: workspace.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success(uiZh.workspaceRestored);
                    router.refresh();
                  });
                }}
              >
                {uiZh.restoreWorkspace}
              </Button>
            ) : (
              <>
                {workspace.status !== "suspended" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="border-white/15 text-white"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await suspendWorkspaceAction({
                          workspaceId: workspace.id,
                        });
                        if (!result.ok) {
                          toast.error(result.error);
                          return;
                        }
                        toast.success(uiZh.workspaceSuspended);
                        router.refresh();
                      });
                    }}
                  >
                    {uiZh.suspend}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await archiveWorkspaceAction({
                        workspaceId: workspace.id,
                      });
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      toast.success(uiZh.workspaceArchived);
                      router.refresh();
                    });
                  }}
                >
                  {uiZh.archiveWorkspace}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
