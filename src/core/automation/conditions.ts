/**
 * Automation condition catalog (contracts only — Project 039).
 * No evaluation engine yet.
 */

import type { AutomationConditionType } from "@/core/automation/constants";
import { AUTOMATION_CONDITION_TYPES } from "@/core/automation/constants";
import type { AutomationCondition } from "@/core/automation/types";

export type AutomationConditionDefinition = {
  type: AutomationConditionType;
  label: string;
  description: string;
  requiresValue: boolean;
  requiresValueTo: boolean;
};

export const AUTOMATION_CONDITION_CATALOG: readonly AutomationConditionDefinition[] =
  [
    {
      type: "equals",
      label: "等于",
      description: "字段等于某个值",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "not_equals",
      label: "不等于",
      description: "字段不等于某个值",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "contains",
      label: "包含",
      description: "字段包含某个值",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "starts_with",
      label: "开头是",
      description: "字段以某个值开头",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "ends_with",
      label: "结尾是",
      description: "字段以某个值结尾",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "greater_than",
      label: "大于",
      description: "字段大于某个值",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "less_than",
      label: "小于",
      description: "字段小于某个值",
      requiresValue: true,
      requiresValueTo: false,
    },
    {
      type: "between",
      label: "介于",
      description: "字段介于两个值之间",
      requiresValue: true,
      requiresValueTo: true,
    },
    {
      type: "empty",
      label: "为空",
      description: "字段为空",
      requiresValue: false,
      requiresValueTo: false,
    },
    {
      type: "not_empty",
      label: "不为空",
      description: "字段不为空",
      requiresValue: false,
      requiresValueTo: false,
    },
  ] as const;

export function isAutomationConditionType(
  value: string,
): value is AutomationConditionType {
  return (AUTOMATION_CONDITION_TYPES as readonly string[]).includes(value);
}

export function getAutomationConditionDefinition(
  type: AutomationConditionType,
): AutomationConditionDefinition | undefined {
  return AUTOMATION_CONDITION_CATALOG.find((item) => item.type === type);
}

export function createAutomationCondition(input: {
  id: string;
  type: AutomationConditionType;
  field: string;
  value?: unknown;
  valueTo?: unknown | null;
}): AutomationCondition {
  return {
    id: input.id,
    type: input.type,
    field: input.field,
    value: input.value ?? null,
    valueTo: input.valueTo ?? null,
  };
}
