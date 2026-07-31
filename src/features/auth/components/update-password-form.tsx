"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Bilingual } from "@/components/ui/bilingual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authCopy } from "@/features/auth/copy";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/features/auth/schemas/auth";
import {
  authCardClassName,
  authFieldClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/lib/auth-ui";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <div className={authCardClassName}>
      <div className="space-y-1">
        <Bilingual
          text={authCopy.updatePassword}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <Bilingual
          text={authCopy.updatePasswordSubtitle}
          compact
          zhClassName="font-normal text-white/55"
          enClassName="text-white/30"
        />
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            try {
              const supabase = createClient();
              const { error } = await supabase.auth.updateUser({
                password: values.password,
              });
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success(
                `${authCopy.passwordUpdated.zh} / ${authCopy.passwordUpdated.en}`,
              );
              router.replace("/dashboard/enter");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not update password";
              toast.error(message);
            }
          });
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="new-password">
            {authCopy.password.zh} / {authCopy.password.en}
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className={authFieldClassName}
            {...form.register("password")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">
            {authCopy.confirmPassword.zh} / {authCopy.confirmPassword.en}
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className={authFieldClassName}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className={authPrimaryButtonClassName}
        >
          {authCopy.updatePassword.zh} / {authCopy.updatePassword.en}
        </Button>
      </form>
    </div>
  );
}
