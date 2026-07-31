/**
 * Automation domain foundation — contracts + validation (Project 039).
 * See docs/architecture/DOMAIN_ARCHITECTURE.md
 *
 * No UI · No Workspace · No execution engine · No scheduler · No queue · No worker.
 */

export type {
  Automation,
  AutomationAction,
  AutomationActionType,
  AutomationCondition,
  AutomationConditionType,
  AutomationExecution,
  AutomationExecutionId,
  AutomationExecutionStatus,
  AutomationId,
  AutomationMetadata,
  AutomationModel,
  AutomationStatus,
  AutomationTrigger,
  AutomationTriggerType,
  AutomationType,
  Execution,
  Rule,
  Workflow,
} from "@/core/automation/types";

export {
  AUTOMATION_ACTION_TYPES,
  AUTOMATION_CONDITION_TYPES,
  AUTOMATION_EXECUTION_STATUSES,
  AUTOMATION_STATUSES,
  AUTOMATION_TRIGGER_TYPES,
  AUTOMATION_TYPES,
} from "@/core/automation/constants";

export type {
  AutomationActionInput,
  AutomationConditionInput,
  AutomationIdInput,
  AutomationTriggerInput,
  CreateAutomationInput,
  DeleteAutomationInput,
  DisableAutomationInput,
  EnableAutomationInput,
  ListAutomationsQuery,
  UpdateAutomationInput,
} from "@/core/automation/schema";

export {
  automationActionSchema,
  automationActionTypeSchema,
  automationConditionSchema,
  automationConditionTypeSchema,
  automationExecutionSchema,
  automationExecutionStatusSchema,
  automationIdSchema,
  automationKindSchema,
  automationSchema,
  automationStatusSchema,
  automationTriggerSchema,
  automationTriggerTypeSchema,
  createAutomationSchema,
  deleteAutomationSchema,
  disableAutomationSchema,
  enableAutomationSchema,
  listAutomationsQuerySchema,
  updateAutomationSchema,
} from "@/core/automation/schema";

export type { AutomationRepository } from "@/core/automation/repository";

export type { AutomationService } from "@/core/automation/service";
export {
  validateAction,
  validateAutomationId,
  validateCondition,
  validateDeleteAutomation,
  validateDisableAutomation,
  validateEnableAutomation,
  validateListAutomationsQuery,
  validateTrigger,
  validateUpdateAutomation,
  validateWorkflow,
} from "@/core/automation/service";

export type { AutomationPermission } from "@/core/automation/permissions";
export { AUTOMATION_PERMISSIONS } from "@/core/automation/permissions";

export type {
  AutomationDomainEvent,
  AutomationEventName,
} from "@/core/automation/events";
export { AUTOMATION_EVENTS } from "@/core/automation/events";

export type { AutomationTriggerDefinition } from "@/core/automation/triggers";
export {
  AUTOMATION_TRIGGER_CATALOG,
  createAutomationTrigger,
  getAutomationTriggerDefinition,
  isAutomationTriggerType,
} from "@/core/automation/triggers";

export type { AutomationConditionDefinition } from "@/core/automation/conditions";
export {
  AUTOMATION_CONDITION_CATALOG,
  createAutomationCondition,
  getAutomationConditionDefinition,
  isAutomationConditionType,
} from "@/core/automation/conditions";

export type { AutomationActionDefinition } from "@/core/automation/actions";
export {
  AUTOMATION_ACTION_CATALOG,
  createAutomationAction,
  getAutomationActionDefinition,
  isAutomationActionType,
} from "@/core/automation/actions";
