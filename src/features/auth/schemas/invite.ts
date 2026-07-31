import { z } from "zod";

import { uiZh } from "@/config/ui-zh";

export const INVITE_ROLES = [
  "admin",
  "coordinator",
  "event_planner",
  "finance",
  "sales",
  "designer",
  "staff",
] as const;

export type InviteRole = (typeof INVITE_ROLES)[number];

export const INVITE_ROLE_LABELS: Record<
  InviteRole,
  { zh: string; en: string }
> = {
  admin: { zh: "管理员", en: "Admin" },
  coordinator: { zh: "统筹", en: "Coordinator" },
  event_planner: { zh: "活动策划", en: "Event Planner" },
  finance: { zh: "财务", en: "Finance" },
  sales: { zh: "销售", en: "Sales" },
  designer: { zh: "设计师", en: "Designer" },
  staff: { zh: "员工", en: "Staff" },
};

export const INVITATION_TTL_HOURS = 72;

export const inviteUserSchema = z.object({
  fullName: z.string().min(1, uiZh.fullNameRequired).max(120),
  email: z.string().email(uiZh.validEmailRequired),
  company: z.string().min(1, uiZh.companyRequired).max(160),
  role: z.enum(INVITE_ROLES),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const acceptInvitationSchema = z
  .object({
    token: z.string().min(20, "Invalid invitation token"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
