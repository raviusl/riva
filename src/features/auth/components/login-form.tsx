"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Bilingual } from "@/components/ui/bilingual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authCopy } from "@/features/auth/copy";
import {
  forgotPasswordSchema,
  signInSchema,
  type ForgotPasswordInput,
  type SignInInput,
} from "@/features/auth/schemas/auth";
import {
  authCardClassName,
  authFieldClassName,
  authPrimaryButtonClassName,
  resolvePostLoginHref,
  safeAuthNextPath,
} from "@/features/auth/lib/auth-ui";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "forgot";

function AuthFormInner() {
  const searchParams = useSearchParams();
  const nextPath = safeAuthNextPath(searchParams.get("next"));
  const reason = searchParams.get("reason");
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, startTransition] = useTransition();

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (reason === "session_expired") {
      toast.message("Session expired. Please sign in again.");
      return;
    }
    if (reason === "signed_out") {
      toast.message("Signed out.");
    }
  }, [reason]);

  function switchMode(next: Mode) {
    setMode(next);
    signInForm.clearErrors();
    forgotForm.clearErrors();
    if (next === "forgot") {
      forgotForm.setValue("email", signInForm.getValues("email"));
    }
  }

  const title = mode === "signin" ? authCopy.signIn : authCopy.forgotPassword;
  const subtitle =
    mode === "signin"
      ? authCopy.signInSubtitle
      : authCopy.forgotPasswordSubtitle;

  return (
    <div className={authCardClassName}>
      <div className="space-y-1">
        <Bilingual
          text={title}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <Bilingual
          text={subtitle}
          compact
          zhClassName="font-normal text-white/55"
          enClassName="text-white/30"
        />
      </div>

      {mode === "signin" ? (
        <form
          className="space-y-4"
          onSubmit={signInForm.handleSubmit((values) => {
            startTransition(async () => {
              try {
                const supabase = createClient();
                const { error } = await supabase.auth.signInWithPassword(values);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                window.location.assign(resolvePostLoginHref(nextPath));
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Sign in failed";
                toast.error(message);
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="signin-email">
              {authCopy.email.zh} / {authCopy.email.en}
            </Label>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              className={authFieldClassName}
              {...signInForm.register("email")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password">
              {authCopy.password.zh} / {authCopy.password.en}
            </Label>
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              className={authFieldClassName}
              {...signInForm.register("password")}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className={authPrimaryButtonClassName}
          >
            {authCopy.signIn.zh} / {authCopy.signIn.en}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={forgotForm.handleSubmit((values) => {
            startTransition(async () => {
              try {
                const supabase = createClient();
                const origin = window.location.origin;
                const { error } = await supabase.auth.resetPasswordForEmail(
                  values.email,
                  {
                    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
                  },
                );
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(
                  `${authCopy.resetEmailSent.zh} / ${authCopy.resetEmailSent.en}`,
                );
                switchMode("signin");
                signInForm.setValue("email", values.email);
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Could not send reset email";
                toast.error(message);
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="forgot-email">
              {authCopy.email.zh} / {authCopy.email.en}
            </Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className={authFieldClassName}
              {...forgotForm.register("email")}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className={authPrimaryButtonClassName}
          >
            {authCopy.sendResetLink.zh} / {authCopy.sendResetLink.en}
          </Button>
        </form>
      )}

      <button
        type="button"
        className="w-full text-left text-xs text-white/45 transition-colors hover:text-white/75"
        onClick={() => switchMode(mode === "signin" ? "forgot" : "signin")}
      >
        {mode === "signin"
          ? `${authCopy.forgotPassword.zh} / ${authCopy.forgotPassword.en}`
          : `${authCopy.backToSignIn.zh} / ${authCopy.backToSignIn.en}`}
      </button>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="h-72 w-full max-w-sm animate-pulse rounded-2xl bg-white/[0.04]" />
      }
    >
      <AuthFormInner />
    </Suspense>
  );
}
