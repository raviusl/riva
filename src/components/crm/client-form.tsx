"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { composeClientNotes } from "@/components/crm/client-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";
import { createClientAction } from "@/core/actions/client-actions";
import { cn } from "@/lib/utils";

const clientFormSchema = z.object({
  name: z.string().trim().min(1, uiZh.clientNameRequired).max(160),
  companyName: z.string().trim().max(160).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      uiZh.validEmailRequired,
    ),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

type ClientFormProps = {
  workspaceId: string;
  companyId: string;
  onSuccess?: (clientId: string) => void;
  onCancel?: () => void;
  className?: string;
};

export function ClientForm({
  workspaceId,
  companyId,
  onSuccess,
  onCancel,
  className,
}: ClientFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createClientAction({
            workspaceId,
            companyId,
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            notes: composeClientNotes(values.companyName, values.notes),
            status: "inquiry",
            clientType: "wedding",
          });

          if (!result.ok) {
            toast.error(result.error);
            return;
          }

          toast.success(uiZh.clientCreated);
          form.reset();
          if (onSuccess) {
            onSuccess(result.data.clientId);
          } else {
            router.push(`/dashboard/clients/${result.data.clientId}`);
          }
          router.refresh();
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="crm-client-name">{uiZh.clientName}</Label>
        <Input
          id="crm-client-name"
          autoComplete="organization"
          placeholder={uiZh.clientName}
          disabled={pending}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-300/90">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="crm-client-company">
          {uiZh.companyOptional}{" "}
          <span className="font-normal text-white/35">{uiZh.optionalParen}</span>
        </Label>
        <Input
          id="crm-client-company"
          placeholder={uiZh.companyName}
          disabled={pending}
          {...form.register("companyName")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crm-client-email">{uiZh.email}</Label>
          <Input
            id="crm-client-email"
            type="email"
            autoComplete="email"
            placeholder={uiZh.emailPlaceholder}
            disabled={pending}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-red-300/90">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="crm-client-phone">{uiZh.phone}</Label>
          <Input
            id="crm-client-phone"
            type="tel"
            autoComplete="tel"
            placeholder={uiZh.phone}
            disabled={pending}
            {...form.register("phone")}
          />
          {form.formState.errors.phone ? (
            <p className="text-xs text-red-300/90">
              {form.formState.errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crm-client-notes">{uiZh.notes}</Label>
        <Textarea
          id="crm-client-notes"
          placeholder={uiZh.optionalNotes}
          disabled={pending}
          {...form.register("notes")}
        />
        {form.formState.errors.notes ? (
          <p className="text-xs text-red-300/90">
            {form.formState.errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
          >
            {uiZh.cancel}
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? uiZh.creating : uiZh.createClient}
        </Button>
      </div>
    </form>
  );
}
