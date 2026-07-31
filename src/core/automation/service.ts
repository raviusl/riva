import {
  automationActionSchema,
  automationConditionSchema,
  automationIdSchema,
  automationTriggerSchema,
  createAutomationSchema,
  deleteAutomationSchema,
  disableAutomationSchema,
  enableAutomationSchema,
  listAutomationsQuerySchema,
  updateAutomationSchema,
  type AutomationActionInput,
  type AutomationConditionInput,
  type AutomationIdInput,
  type AutomationTriggerInput,
  type CreateAutomationInput,
  type DeleteAutomationInput,
  type DisableAutomationInput,
  type EnableAutomationInput,
  type ListAutomationsQuery,
  type UpdateAutomationInput,
} from "@/core/automation/schema";
import type { Automation } from "@/core/automation/types";

/**
 * Automation domain service contract.
 * Project 039: validation helpers only — no execution / scheduling.
 */
export interface AutomationService {
  getAutomation(input: AutomationIdInput): Promise<Automation>;
  listAutomations(query: ListAutomationsQuery): Promise<Automation[]>;
  createAutomation(input: CreateAutomationInput): Promise<Automation>;
  updateAutomation(input: UpdateAutomationInput): Promise<Automation>;
  deleteAutomation(input: DeleteAutomationInput): Promise<void>;
  enableAutomation(input: EnableAutomationInput): Promise<Automation>;
  disableAutomation(input: DisableAutomationInput): Promise<Automation>;
}

/** Validate create / full workflow input. Persistence deferred. */
export function validateWorkflow(input: unknown): CreateAutomationInput {
  return createAutomationSchema.parse(input);
}

/** Validate trigger configuration. */
export function validateTrigger(input: unknown): AutomationTriggerInput {
  return automationTriggerSchema.parse(input);
}

/** Validate a single condition clause. */
export function validateCondition(input: unknown): AutomationConditionInput {
  return automationConditionSchema.parse(input);
}

/** Validate a single action step. */
export function validateAction(input: unknown): AutomationActionInput {
  return automationActionSchema.parse(input);
}

/** Validate update input. Persistence deferred. */
export function validateUpdateAutomation(
  input: unknown,
): UpdateAutomationInput {
  return updateAutomationSchema.parse(input);
}

/** Validate list query. Persistence deferred. */
export function validateListAutomationsQuery(
  input: unknown,
): ListAutomationsQuery {
  return listAutomationsQuerySchema.parse(input);
}

/** Validate automation id input. Persistence deferred. */
export function validateAutomationId(input: unknown): AutomationIdInput {
  return automationIdSchema.parse(input);
}

/** Validate delete input. Persistence deferred. */
export function validateDeleteAutomation(
  input: unknown,
): DeleteAutomationInput {
  return deleteAutomationSchema.parse(input);
}

/** Validate enable input. Persistence deferred. */
export function validateEnableAutomation(
  input: unknown,
): EnableAutomationInput {
  return enableAutomationSchema.parse(input);
}

/** Validate disable input. Persistence deferred. */
export function validateDisableAutomation(
  input: unknown,
): DisableAutomationInput {
  return disableAutomationSchema.parse(input);
}
