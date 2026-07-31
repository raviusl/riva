import { z } from "zod";

import {
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_CONDITION_TYPES,
  AUTOMATION_EXECUTION_STATUSES,
  AUTOMATION_STATUSES,
  AUTOMATION_TRIGGER_TYPES,
} from "@/core/automation/constants";

export const automationStatusSchema = z.enum(AUTOMATION_STATUSES);
export const automationExecutionStatusSchema = z.enum(
  AUTOMATION_EXECUTION_STATUSES,
);
export const automationTriggerTypeSchema = z.enum(AUTOMATION_TRIGGER_TYPES);
export const automationConditionTypeSchema = z.enum(AUTOMATION_CONDITION_TYPES);
export const automationActionTypeSchema = z.enum(AUTOMATION_ACTION_TYPES);
export const automationKindSchema = z.enum(["workflow", "rule"]);

const metadataSchema = z.record(z.string(), z.unknown());

export const automationTriggerSchema = z
  .object({
    type: automationTriggerTypeSchema,
    schedule: z.string().min(1).max(200).optional().nullable(),
    metadata: metadataSchema.optional().default({}),
  })
  .superRefine((value, ctx) => {
    if (value.type === "time_schedule" && !value.schedule) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "time_schedule triggers require a schedule",
        path: ["schedule"],
      });
    }
  });

export type AutomationTriggerInput = z.infer<typeof automationTriggerSchema>;

export const automationConditionSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: automationConditionTypeSchema,
    field: z.string().min(1).max(200),
    value: z.unknown().optional().nullable(),
    valueTo: z.unknown().optional().nullable(),
  })
  .superRefine((value, ctx) => {
    const needsValue = ![
      "empty",
      "not_empty",
    ].includes(value.type);
    if (needsValue && (value.value === undefined || value.value === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${value.type} conditions require a value`,
        path: ["value"],
      });
    }
    if (value.type === "between" && (value.valueTo === undefined || value.valueTo === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "between conditions require valueTo",
        path: ["valueTo"],
      });
    }
  });

export type AutomationConditionInput = z.infer<
  typeof automationConditionSchema
>;

export const automationActionSchema = z.object({
  id: z.string().min(1).max(64),
  type: automationActionTypeSchema,
  order: z.number().int().nonnegative(),
  config: metadataSchema.optional().default({}),
});

export type AutomationActionInput = z.infer<typeof automationActionSchema>;

export const automationIdSchema = z.object({
  automationId: z.string().uuid(),
});

export type AutomationIdInput = z.infer<typeof automationIdSchema>;

export const createAutomationSchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Automation name is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  type: automationKindSchema.optional().default("workflow"),
  trigger: automationTriggerSchema,
  conditions: z.array(automationConditionSchema).optional().default([]),
  actions: z.array(automationActionSchema).min(1, "At least one action is required"),
  status: automationStatusSchema.optional().default("draft"),
  enabled: z.boolean().optional().default(false),
  createdBy: z.string().uuid(),
});

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;

export const updateAutomationSchema = z.object({
  automationId: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  type: automationKindSchema.optional(),
  trigger: automationTriggerSchema.optional(),
  conditions: z.array(automationConditionSchema).optional(),
  actions: z.array(automationActionSchema).min(1).optional(),
  status: automationStatusSchema.optional(),
  enabled: z.boolean().optional(),
  updatedBy: z.string().uuid(),
});

export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;

export const listAutomationsQuerySchema = z.object({
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  type: automationKindSchema.optional(),
  status: automationStatusSchema.optional(),
  enabled: z.boolean().optional(),
  triggerType: automationTriggerTypeSchema.optional(),
});

export type ListAutomationsQuery = z.infer<typeof listAutomationsQuerySchema>;

export const deleteAutomationSchema = z.object({
  automationId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DeleteAutomationInput = z.infer<typeof deleteAutomationSchema>;

export const enableAutomationSchema = z.object({
  automationId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type EnableAutomationInput = z.infer<typeof enableAutomationSchema>;

export const disableAutomationSchema = z.object({
  automationId: z.string().uuid(),
  actorId: z.string().uuid(),
});

export type DisableAutomationInput = z.infer<typeof disableAutomationSchema>;

/** Full Automation shape validation (read model). */
export const automationSchema = z.object({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).nullable(),
  type: automationKindSchema,
  trigger: automationTriggerSchema,
  conditions: z.array(automationConditionSchema),
  actions: z.array(automationActionSchema),
  status: automationStatusSchema,
  enabled: z.boolean(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid().nullable(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const automationExecutionSchema = z.object({
  id: z.string().uuid(),
  automationId: z.string().uuid(),
  companyId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  status: automationExecutionStatusSchema,
  startedAt: z.string().min(1).max(64).nullable(),
  finishedAt: z.string().min(1).max(64).nullable(),
  error: z.string().max(5000).nullable(),
  metadata: metadataSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
