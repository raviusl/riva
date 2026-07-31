import type { BilingualText } from "@/config/i18n";

/**
 * Auth-local copy. Keep login / password screens independent of global `copy`
 * so invitation-only auth cannot break when global i18n keys change.
 */
export const authCopy = {
  signIn: { zh: "登录", en: "Sign In" },
  signInSubtitle: {
    zh: "登录以进入 RIVA Workspace",
    en: "Sign in to open your RIVA Workspace",
  },
  forgotPassword: { zh: "忘记密码", en: "Forgot Password" },
  forgotPasswordSubtitle: {
    zh: "输入邮箱以接收重置链接",
    en: "Enter your email to receive a reset link",
  },
  sendResetLink: { zh: "发送重置链接", en: "Send Reset Link" },
  resetEmailSent: {
    zh: "若该邮箱存在账户，重置链接已发送。",
    en: "If an account exists for that email, a reset link has been sent.",
  },
  backToSignIn: { zh: "返回登录", en: "Back to Sign In" },
  updatePassword: { zh: "设置新密码", en: "Set New Password" },
  updatePasswordSubtitle: {
    zh: "为您的 RIVA OS 账户创建新密码",
    en: "Create a new password for your RIVA OS account",
  },
  confirmPassword: { zh: "确认密码", en: "Confirm Password" },
  passwordUpdated: {
    zh: "密码已更新。",
    en: "Password updated.",
  },
  email: { zh: "邮箱", en: "Email" },
  password: { zh: "密码", en: "Password" },
} as const satisfies Record<string, BilingualText>;
