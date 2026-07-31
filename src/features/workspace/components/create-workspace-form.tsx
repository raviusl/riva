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
import { createWorkspaceAction } from "@/core/actions/workspace-actions";
import { slugify } from "@/core/lib/slug";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const formSchema = z.object({
  name: z.string().min(1, uiZh.workspaceNameRequired).max(120),
  slug: z.string().max(64).optional(),
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  country: z.string().max(2).optional(),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      timezone: "UTC",
      locale: "en",
      currency: "USD",
      country: "",
      logoUrl: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const slug = values.slug?.trim();
          const country = values.country?.trim().toUpperCase();
          const logoUrl = values.logoUrl?.trim();

          const result = await createWorkspaceAction({
            name: values.name,
            slug: slug || undefined,
            timezone: values.timezone,
            locale: values.locale,
            currency: values.currency.toUpperCase(),
            country: country || null,
            logoUrl: logoUrl || null,
            status: "active",
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.workspaceCreated);
          router.push("/dashboard/settings/workspace");
          router.refresh();
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="workspace-name">{uiZh.name}</Label>
        <Input
          id="workspace-name"
          className={authFieldClassName}
          placeholder={uiZh.placeholderWorkspaceName}
          disabled={pending}
          {...form.register("name", {
            onChange: (event) => {
              const name = event.target.value as string;
              if (!form.getValues("slug")) {
                form.setValue("slug", slugify(name), { shouldValidate: false });
              }
            },
          })}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-slug">{uiZh.slug}</Label>
        <Input
          id="workspace-slug"
          className={authFieldClassName}
          placeholder={uiZh.placeholderWorkspaceSlug}
          disabled={pending}
          {...form.register("slug")}
        />
        <p className="text-xs text-white/35">{uiZh.slugUniqueHint}</p>
        {form.formState.errors.slug ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workspace-timezone">{uiZh.timezone}</Label>
          <Input
            id="workspace-timezone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("timezone")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace-locale">{uiZh.locale}</Label>
          <Input
            id="workspace-locale"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("locale")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace-currency">{uiZh.currency}</Label>
          <Input
            id="workspace-currency"
            className={authFieldClassName}
            maxLength={3}
            disabled={pending}
            {...form.register("currency")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace-country">{uiZh.countryIso}</Label>
          <Input
            id="workspace-country"
            className={authFieldClassName}
            maxLength={2}
            placeholder={uiZh.placeholderCountry}
            disabled={pending}
            {...form.register("country")}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? uiZh.creating : uiZh.createWorkspace}
      </Button>
    </form>
  );
}
