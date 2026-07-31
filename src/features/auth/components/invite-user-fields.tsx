"use client";

import { useEffect } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiZh } from "@/config/ui-zh";
import {
  INVITE_ROLE_LABELS,
  INVITE_ROLES,
  inviteUserSchema,
  type InviteUserInput,
} from "@/features/auth/schemas/invite";

export const inviteFieldClass =
  "border-white/10 bg-white/5 text-white placeholder:text-white/30";

export function useInviteUserForm() {
  return useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      role: "staff",
    },
  });
}

export function InviteUserFields({
  form,
  idPrefix = "invite",
}: {
  form: UseFormReturn<InviteUserInput>;
  idPrefix?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-fullName`}>{uiZh.fullName}</Label>
        <Input
          id={`${idPrefix}-fullName`}
          className={inviteFieldClass}
          autoComplete="name"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-email`}>{uiZh.email}</Label>
        <Input
          id={`${idPrefix}-email`}
          type="email"
          className={inviteFieldClass}
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-company`}>{uiZh.company}</Label>
        <Input
          id={`${idPrefix}-company`}
          className={inviteFieldClass}
          autoComplete="organization"
          {...form.register("company")}
        />
        {form.formState.errors.company ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.company.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-role`}>{uiZh.role}</Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <select
              id={`${idPrefix}-role`}
              className={`flex h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${inviteFieldClass}`}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            >
              {INVITE_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#111] text-white">
                  {INVITE_ROLE_LABELS[role].zh}
                </option>
              ))}
            </select>
          )}
        />
        {form.formState.errors.role ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.role.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function notifyInvitationDelivery(result: {
  email: string;
  emailSent: boolean;
  inviteUrl?: string;
  emailWarning?: string;
}) {
  if (result.emailSent) {
    toast.success(uiZh.invitationSentTo(result.email));
    return;
  }

  toast.success(uiZh.invitationCreated);
  if (result.emailWarning) {
    toast.message(result.emailWarning);
  }
  if (result.inviteUrl) {
    toast.message(uiZh.inviteLinkCopyNow, {
      description: result.inviteUrl,
      duration: 20_000,
    });
  }
}

export function useResetInviteFormOnOpen(
  open: boolean,
  form: UseFormReturn<InviteUserInput>,
) {
  useEffect(() => {
    if (open) {
      form.reset({
        fullName: "",
        email: "",
        company: "",
        role: "staff",
      });
    }
  }, [open, form]);
}
