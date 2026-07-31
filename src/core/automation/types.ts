/**
 * Shared Automation domain types — platform foundation (Project 039).
 */

import type {
  AutomationActionType,
  AutomationConditionType,
  AutomationExecutionStatus,
  AutomationStatus,
  AutomationTriggerType,
  AutomationType,
} from "@/core/automation/constants";

export type {
  AutomationActionType,
  AutomationConditionType,
  AutomationExecutionStatus,
  AutomationStatus,
  AutomationTriggerType,
  AutomationType,
} from "@/core/automation/constants";

export type AutomationId = string;
export type AutomationExecutionId = string;

export type AutomationMetadata = Readonly<Record<string, unknown>>;

/** Trigger configuration attached to a workflow / rule. */
export type AutomationTrigger = {
  type: AutomationTriggerType;
  /** Optional cron / ISO schedule for time_schedule triggers. */
  schedule: string | null;
  metadata: AutomationMetadata;
};

/** Condition clause evaluated before actions run. */
export type AutomationCondition = {
  id: string;
  type: AutomationConditionType;
  field: string;
  value: unknown;
  /** Second bound for `between` conditions. */
  valueTo: unknown | null;
};

/** Action step executed when conditions pass. */
export type AutomationAction = {
  id: string;
  type: AutomationActionType;
  order: number;
  config: AutomationMetadata;
};

/**
 * Core Automation entity (workflow / rule definition).
 * Execution engine, scheduler, queue, and workers are deferred.
 */
export type Automation = {
  id: AutomationId;
  companyId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  type: Extract<AutomationType, "workflow" | "rule">;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  status: AutomationStatus;
  enabled: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AutomationModel = Automation;

export type Workflow = Automation & { type: "workflow" };
export type Rule = Automation & { type: "rule" };

/** Single automation run record (contracts only — no engine). */
export type AutomationExecution = {
  id: AutomationExecutionId;
  automationId: AutomationId;
  companyId: string;
  workspaceId: string;
  status: AutomationExecutionStatus;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  metadata: AutomationMetadata;
  createdAt: string;
  updatedAt: string;
};

export type Execution = AutomationExecution;
